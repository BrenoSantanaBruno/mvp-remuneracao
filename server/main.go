package main

import (
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// Empresa é o container jurídico (CNPJ raiz) e pode ter vários estabelecimentos.
type Empresa struct {
	ID                      int64  `json:"id"`
	Code                    string `json:"code"`
	Name                    string `json:"name"`         // alias para razão social no front
	RazaoSocial             string `json:"razaoSocial"`  // razão social para integrações/futuras migrações
	Fantasia                string `json:"fantasia"`     // alias para nome fantasia
	NomeFantasia            string `json:"nomeFantasia"` // nome fantasia
	Status                  string `json:"status"`
	EstabelecimentoMatrizID *int64 `json:"estabelecimentoMatrizId"` // estabelece quem consolida guias
}

// Estabelecimento representa matriz ou filial (lotação) com responsabilidades fiscais.
type Estabelecimento struct {
	ID                       int64  `json:"id"`
	EmpresaID                int64  `json:"empresaId"`
	Codigo                   string `json:"codigo"`
	Tipo                     string `json:"tipo"` // matriz ou filial
	CNPJ                     string `json:"cnpj"`
	CNAE                     string `json:"cnae"`
	Logradouro               string `json:"logradouro"`
	Numero                   string `json:"numero"`
	Complemento              string `json:"complemento"`
	Bairro                   string `json:"bairro"`
	Cidade                   string `json:"cidade"`
	Estado                   string `json:"estado"`
	CEP                      string `json:"cep"`
	Ativo                    bool   `json:"ativo"`
	SindicatoPatronalID      int64  `json:"sindicatoPatronalId"`
	SindicatoTrabalhadoresID int64  `json:"sindicatoTrabalhadoresId"`
	ConsolidarGuiasNaMatriz  bool   `json:"consolidarGuiasNaMatriz"` // define se guia consolida na matriz
}

type CentroCusto struct {
	ID                int64  `json:"id"`
	EstabelecimentoID int64  `json:"estabelecimentoId"`
	Codigo            string `json:"codigo"`
	CustomCode        string `json:"customCode"` // código digitado pelo usuário (ex: CC-001)
	Descricao         string `json:"descricao"`
	Subdivisao        string `json:"subdivisao"`
	Ativo             bool   `json:"ativo"`
}

type Sindicato struct {
	ID                  int64  `json:"id"`
	Nome                string `json:"nome"`
	Tipo                string `json:"tipo"` // patronal ou trabalhadores
	CNPJ                string `json:"cnpj"`
	Cidade              string `json:"cidade"`
	UF                  string `json:"uf"`
	SindicatoPatronalID int64  `json:"sindicatoPatronalId"`
	Ativo               bool   `json:"ativo"`
}

type Convencao struct {
	ID                       int64  `json:"id"`
	SindicatoTrabalhadoresID int64  `json:"sindicatoTrabalhadoresId"`
	SindicatoPatronalID      int64  `json:"sindicatoPatronalId"`
	CNAE                     string `json:"cnae"`
	Cidade                   string `json:"cidade"`
	UF                       string `json:"uf"`
	VigenciaInicio           string `json:"vigenciaInicio"`
	VigenciaFim              string `json:"vigenciaFim"`
	DocumentoURL             string `json:"documentoUrl"`
	Observacoes              string `json:"observacoes"`
}

type QuadroOrcamentario struct {
	ID                int64   `json:"id"`
	EstabelecimentoID int64   `json:"estabelecimentoId"`
	CentroCustoID     int64   `json:"centroCustoId"`
	Ano               int     `json:"ano"`
	Mes               int     `json:"mes"`
	ValorOrcado       float64 `json:"valorOrcado"`
	Observacao        string  `json:"observacao"`
	Ativo             bool    `json:"ativo"`
}

type Cargo struct {
	ID     int64  `json:"id"`
	Titulo string `json:"titulo"`
	Area   string `json:"area"` // agora será o centro de custo
	Nivel  string `json:"nivel"`
	Pontos int    `json:"pontos"`
}

type Funcionario struct {
	ID                int64   `json:"id"`
	Nome              string  `json:"nome"`
	Cargo             string  `json:"cargo"`
	EstabelecimentoID int64   `json:"estabelecimentoId"`
	CentroCustoID     int64   `json:"centroCustoId"`
	Gestor            string  `json:"gestor"`
	Admissao          string  `json:"admissao"`
	Salario           float64 `json:"salario"`
	Status            string  `json:"status"`
}

type MovimentacaoCentroCusto struct {
	ID                   int64  `json:"id"`
	FuncionarioID        int64  `json:"funcionarioId"`
	OrigemCentroCustoID  *int64 `json:"origemCentroCustoId"`
	DestinoCentroCustoID int64  `json:"destinoCentroCustoId"`
	DataMovimentacao     string `json:"dataMovimentacao"`
	Observacao           string `json:"observacao"`
}

type TabelaSalarial struct {
	ID       int64   `json:"id"`
	Nome     string  `json:"nome"`
	Cargo    string  `json:"cargo"`
	FaixaMin float64 `json:"faixaMin"`
	FaixaMed float64 `json:"faixaMed"`
	FaixaMax float64 `json:"faixaMax"`
	Moeda    string  `json:"moeda"`
}

type Avaliacao struct {
	ID         int64  `json:"id"`
	Cargo      string `json:"cargo"`
	Avaliador  string `json:"avaliador"`
	Comentario string `json:"comentario"`
	Data       string `json:"data"`
}

type Trilha struct {
	ID    int64  `json:"id"`
	Nome  string `json:"nome"`
	Area  string `json:"area"`
	Ativa bool   `json:"ativa"`
}

var seqID int64 = 1000

var matrizID int64 = 1

var empresas = []Empresa{
	{ID: 1, Code: "EMP001", Name: "Empresa Exemplo S.A.", RazaoSocial: "Empresa Exemplo S.A.", Fantasia: "Exemplo", NomeFantasia: "Exemplo", Status: "Ativa", EstabelecimentoMatrizID: &matrizID},
}

var estabelecimentos = []Estabelecimento{
	{ID: 1, EmpresaID: 1, Codigo: "EST001", Tipo: "matriz", CNPJ: "46.736.982/0001-85", CNAE: "6201-5/01", Logradouro: "Rua Central", Numero: "100", Bairro: "Centro", Cidade: "Rio de Janeiro", Estado: "RJ", CEP: "20000-000", Ativo: true, SindicatoPatronalID: 1, SindicatoTrabalhadoresID: 2, ConsolidarGuiasNaMatriz: true},
}

var centros = []CentroCusto{
	{ID: 1, EstabelecimentoID: 1, Codigo: "CC-001", CustomCode: "CC-001", Descricao: "Administrativo", Subdivisao: "01", Ativo: true},
	{ID: 2, EstabelecimentoID: 1, Codigo: "CC-002", CustomCode: "CC-002", Descricao: "TI", Subdivisao: "02", Ativo: true},
}

var sindicatos = []Sindicato{
	{ID: 1, Nome: "Sindicato Patronal RJ", Tipo: "patronal", CNPJ: "11.111.111/0001-91", Cidade: "Rio de Janeiro", UF: "RJ", Ativo: true},
	{ID: 2, Nome: "Sindicato dos Trabalhadores RJ", Tipo: "trabalhadores", CNPJ: "22.222.222/0001-09", Cidade: "Rio de Janeiro", UF: "RJ", SindicatoPatronalID: 1, Ativo: true},
}

var convencoes = []Convencao{
	{ID: 1, SindicatoTrabalhadoresID: 2, SindicatoPatronalID: 1, CNAE: "6201-5/01", Cidade: "Rio de Janeiro", UF: "RJ", VigenciaInicio: "2025-01-01", VigenciaFim: "2025-12-31", DocumentoURL: "", Observacoes: "Convenção base TI RJ"},
}

var quadros = []QuadroOrcamentario{
	{ID: 1, EstabelecimentoID: 1, CentroCustoID: 1, Ano: 2025, Mes: 1, ValorOrcado: 150000, Observacao: "Orçamento inicial", Ativo: true},
}

var cargos = []Cargo{
	{ID: 10, Titulo: "Analista de Dados Jr", Area: "CC-002", Nivel: "Júnior", Pontos: 285},
}

var funcionarios = []Funcionario{
	{ID: 20, Nome: "João Silva", Cargo: "Analista de Dados Jr", EstabelecimentoID: 1, CentroCustoID: 2, Gestor: "CTO", Admissao: "2024-08-15", Salario: 5500, Status: "ativo"},
}

var movimentacoesCC = []MovimentacaoCentroCusto{}
var tabelas = []TabelaSalarial{}
var avaliacoes = []Avaliacao{}
var trilhas = []Trilha{
	{ID: 30, Nome: "Trilha Comercial", Area: "CC-001", Ativa: true},
}

func digitsOnly(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func isValidCNPJ(cnpj string) bool {
	clean := digitsOnly(cnpj)
	if len(clean) != 14 {
		return false
	}
	allEqual := true
	for i := 1; i < len(clean); i++ {
		if clean[i] != clean[0] {
			allEqual = false
			break
		}
	}
	if allEqual {
		return false
	}
	calcDigit := func(base string, weights []int) int {
		sum := 0
		for i, w := range weights {
			sum += int(base[i]-'0') * w
		}
		rem := sum % 11
		if rem < 2 {
			return 0
		}
		return 11 - rem
	}
	d1 := calcDigit(clean[:12], []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2})
	d2 := calcDigit(clean[:12]+strconv.Itoa(d1), []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2})
	return d1 == int(clean[12]-'0') && d2 == int(clean[13]-'0')
}

func empresaExiste(id int64, lista []Empresa) bool {
	for _, e := range lista {
		if e.ID == id {
			return true
		}
	}
	return false
}

func empresaTemMatriz(empresaID int64, ignoreID int64, lista []Estabelecimento) bool {
	for _, e := range lista {
		if e.EmpresaID == empresaID && strings.ToLower(e.Tipo) == "matriz" && e.ID != ignoreID {
			return true
		}
	}
	return false
}

func sindicatoByID(id int64) *Sindicato {
	for idx := range sindicatos {
		if sindicatos[idx].ID == id {
			return &sindicatos[idx]
		}
	}
	return nil
}

func validateSindicatos(patronalID, trabalhadoresID int64) error {
	if patronalID == 0 || trabalhadoresID == 0 {
		return errors.New("sindicatos patronal e dos trabalhadores são obrigatórios")
	}
	p := sindicatoByID(patronalID)
	t := sindicatoByID(trabalhadoresID)
	if p == nil || t == nil {
		return errors.New("sindicatos informados não encontrados")
	}
	if strings.ToLower(p.Tipo) != "patronal" {
		return errors.New("sindicato patronal deve ter tipo 'patronal'")
	}
	if strings.ToLower(t.Tipo) != "trabalhadores" {
		return errors.New("sindicato dos trabalhadores deve ter tipo 'trabalhadores'")
	}
	if t.SindicatoPatronalID != 0 && t.SindicatoPatronalID != patronalID {
		return errors.New("sindicato dos trabalhadores deve estar vinculado ao sindicato patronal informado")
	}
	return nil
}

func validateEstabelecimentoInput(body Estabelecimento, current []Estabelecimento, emps []Empresa) error {
	if body.EmpresaID == 0 {
		return errors.New("empresaId é obrigatório")
	}
	if !empresaExiste(body.EmpresaID, emps) {
		return errors.New("empresa não encontrada")
	}
	if body.Tipo == "" {
		return errors.New("tipo do estabelecimento (matriz/filial) é obrigatório")
	}
	tipo := strings.ToLower(body.Tipo)
	if tipo != "matriz" && tipo != "filial" {
		return errors.New("tipo deve ser 'matriz' ou 'filial'")
	}
	if tipo == "matriz" && empresaTemMatriz(body.EmpresaID, body.ID, current) {
		return errors.New("já existe uma matriz cadastrada para esta empresa")
	}
	if !isValidCNPJ(body.CNPJ) {
		return errors.New("cnpj inválido")
	}
	if strings.TrimSpace(body.CNAE) == "" {
		return errors.New("cnae é obrigatório")
	}
	if strings.TrimSpace(body.Cidade) == "" || strings.TrimSpace(body.Estado) == "" {
		return errors.New("cidade e estado são obrigatórios para enquadramento sindical")
	}
	if err := validateSindicatos(body.SindicatoPatronalID, body.SindicatoTrabalhadoresID); err != nil {
		return err
	}
	return nil
}

func validateCentroCustoInput(body CentroCusto, estabs []Estabelecimento) error {
	if body.EstabelecimentoID == 0 {
		return errors.New("estabelecimentoId é obrigatório")
	}
	for _, e := range estabs {
		if e.ID == body.EstabelecimentoID {
			if strings.TrimSpace(body.Codigo) == "" && strings.TrimSpace(body.CustomCode) == "" {
				return errors.New("código do centro de custo é obrigatório")
			}
			return nil
		}
	}
	return errors.New("estabelecimento não encontrado para o centro de custo")
}

func centroCustoByID(id int64) *CentroCusto {
	for idx := range centros {
		if centros[idx].ID == id {
			return &centros[idx]
		}
	}
	return nil
}

func estabelecimentoByID(id int64) *Estabelecimento {
	for idx := range estabelecimentos {
		if estabelecimentos[idx].ID == id {
			return &estabelecimentos[idx]
		}
	}
	return nil
}

func validateFuncionarioInput(body Funcionario) error {
	centro := centroCustoByID(body.CentroCustoID)
	if centro == nil {
		return errors.New("centro de custo não encontrado")
	}
	if !centro.Ativo {
		return errors.New("centro de custo está inativo")
	}
	estab := estabelecimentoByID(body.EstabelecimentoID)
	if estab == nil {
		return errors.New("estabelecimento não encontrado")
	}
	if estab.ID != centro.EstabelecimentoID {
		return errors.New("centro de custo deve pertencer ao mesmo estabelecimento do funcionário")
	}
	if strings.TrimSpace(body.Admissao) != "" {
		if dt, err := time.Parse("2006-01-02", body.Admissao); err == nil {
			if dt.After(time.Now()) {
				return errors.New("data de admissão não pode ser futura")
			}
		}
	}
	return nil
}

func normalizeEmpresa(e *Empresa) {
	e.Name = strings.TrimSpace(e.Name)
	e.RazaoSocial = strings.TrimSpace(e.RazaoSocial)
	if e.RazaoSocial == "" {
		e.RazaoSocial = e.Name
	}
	if e.Name == "" {
		e.Name = e.RazaoSocial
	}
	e.Fantasia = strings.TrimSpace(e.Fantasia)
	e.NomeFantasia = strings.TrimSpace(e.NomeFantasia)
	if e.NomeFantasia == "" {
		e.NomeFantasia = e.Fantasia
	}
	if e.Fantasia == "" {
		e.Fantasia = e.NomeFantasia
	}
	if e.Status == "" {
		e.Status = "Ativa"
	}
}

func recordMovimentacao(funcionarioID int64, origem *int64, destino int64, observacao string) {
	seqID++
	mov := MovimentacaoCentroCusto{
		ID:                   seqID,
		FuncionarioID:        funcionarioID,
		OrigemCentroCustoID:  origem,
		DestinoCentroCustoID: destino,
		DataMovimentacao:     time.Now().Format("2006-01-02"),
		Observacao:           observacao,
	}
	movimentacoesCC = append(movimentacoesCC, mov)
}

func main() {
	r := gin.Default()

	origin := os.Getenv("CORS_ORIGIN")
	if origin == "" {
		origin = "*"
	}
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"ok": true, "time": time.Now()})
		})

		// EMPRESAS
		api.GET("/empresas", func(c *gin.Context) { c.JSON(200, empresas) })
		api.POST("/empresas", func(c *gin.Context) {
			var body Empresa
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			normalizeEmpresa(&body)
			if body.Name == "" || body.Fantasia == "" {
				c.JSON(400, gin.H{"error": "razão social e nome fantasia são obrigatórios"})
				return
			}
			if body.EstabelecimentoMatrizID != nil {
				est := estabelecimentoByID(*body.EstabelecimentoMatrizID)
				if est == nil {
					c.JSON(400, gin.H{"error": "estabelecimento matriz inválido"})
					return
				}
				if strings.ToLower(est.Tipo) != "matriz" {
					c.JSON(400, gin.H{"error": "apenas estabelecimentos do tipo matriz podem ser usados para consolidar guias"})
					return
				}
			}
			seqID++
			body.ID = seqID
			empresas = append(empresas, body)
			c.JSON(201, body)
		})
		api.PUT("/empresas/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			var body Empresa
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			normalizeEmpresa(&body)
			idx := -1
			for i, e := range empresas {
				if e.ID == id {
					idx = i
					break
				}
			}
			if idx == -1 {
				c.JSON(404, gin.H{"error": "empresa não encontrada"})
				return
			}
			body.ID = id
			if body.EstabelecimentoMatrizID != nil {
				est := estabelecimentoByID(*body.EstabelecimentoMatrizID)
				if est == nil || est.EmpresaID != id || strings.ToLower(est.Tipo) != "matriz" {
					c.JSON(400, gin.H{"error": "estabelecimento matriz inválido para a empresa"})
					return
				}
			}
			empresas[idx] = body
			c.JSON(200, body)
		})
		api.DELETE("/empresas/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := empresas[:0]
			for _, e := range empresas {
				if e.ID != id {
					out = append(out, e)
				}
			}
			empresas = out
			c.Status(204)
		})

		// ESTABELECIMENTOS
		api.GET("/estabelecimentos", func(c *gin.Context) { c.JSON(200, estabelecimentos) })
		api.POST("/estabelecimentos", func(c *gin.Context) {
			var body Estabelecimento
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			if err := validateEstabelecimentoInput(body, estabelecimentos, empresas); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			estabelecimentos = append(estabelecimentos, body)
			if strings.ToLower(body.Tipo) == "matriz" {
				for i := range empresas {
					if empresas[i].ID == body.EmpresaID {
						empresas[i].EstabelecimentoMatrizID = &body.ID
					}
				}
			}
			c.JSON(201, body)
		})
		api.PUT("/estabelecimentos/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			var body Estabelecimento
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			body.ID = id
			if err := validateEstabelecimentoInput(body, estabelecimentos, empresas); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			idx := -1
			for i, e := range estabelecimentos {
				if e.ID == id {
					idx = i
					break
				}
			}
			if idx == -1 {
				c.JSON(404, gin.H{"error": "estabelecimento não encontrado"})
				return
			}
			estabelecimentos[idx] = body
			if strings.ToLower(body.Tipo) == "matriz" {
				for i := range empresas {
					if empresas[i].ID == body.EmpresaID {
						empresas[i].EstabelecimentoMatrizID = &body.ID
					}
				}
			}
			c.JSON(200, body)
		})
		api.DELETE("/estabelecimentos/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := estabelecimentos[:0]
			for _, e := range estabelecimentos {
				if e.ID != id {
					out = append(out, e)
				}
			}
			estabelecimentos = out
			for i := range empresas {
				if empresas[i].EstabelecimentoMatrizID != nil && *empresas[i].EstabelecimentoMatrizID == id {
					empresas[i].EstabelecimentoMatrizID = nil
				}
			}
			c.Status(204)
		})

		// CENTROS DE CUSTO
		api.GET("/centros", func(c *gin.Context) { c.JSON(200, centros) })
		api.POST("/centros", func(c *gin.Context) {
			var body CentroCusto
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			if err := validateCentroCustoInput(body, estabelecimentos); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			if body.CustomCode == "" {
				body.CustomCode = body.Codigo
			}
			if body.Codigo == "" {
				body.Codigo = body.CustomCode
			}
			centros = append(centros, body)
			c.JSON(201, body)
		})
		api.PUT("/centros/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			var body CentroCusto
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			body.ID = id
			if err := validateCentroCustoInput(body, estabelecimentos); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			idx := -1
			for i, cc := range centros {
				if cc.ID == id {
					idx = i
					break
				}
			}
			if idx == -1 {
				c.JSON(404, gin.H{"error": "centro de custo não encontrado"})
				return
			}
			if body.CustomCode == "" {
				body.CustomCode = body.Codigo
			}
			if body.Codigo == "" {
				body.Codigo = body.CustomCode
			}
			centros[idx] = body
			c.JSON(200, body)
		})
		api.DELETE("/centros/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := centros[:0]
			for _, e := range centros {
				if e.ID != id {
					out = append(out, e)
				}
			}
			centros = out
			c.Status(204)
		})

		// SINDICATOS
		api.GET("/sindicatos", func(c *gin.Context) { c.JSON(200, sindicatos) })
		api.POST("/sindicatos", func(c *gin.Context) {
			var body Sindicato
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			if body.Ativo == false {
				body.Ativo = true
			}
			sindicatos = append(sindicatos, body)
			c.JSON(201, body)
		})
		api.DELETE("/sindicatos/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := sindicatos[:0]
			for _, e := range sindicatos {
				if e.ID != id {
					out = append(out, e)
				}
			}
			sindicatos = out
			c.Status(204)
		})

		// CONVENCOES
		api.GET("/convencoes", func(c *gin.Context) { c.JSON(200, convencoes) })
		api.POST("/convencoes", func(c *gin.Context) {
			var body Convencao
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			convencoes = append(convencoes, body)
			c.JSON(201, body)
		})
		api.DELETE("/convencoes/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := convencoes[:0]
			for _, e := range convencoes {
				if e.ID != id {
					out = append(out, e)
				}
			}
			convencoes = out
			c.Status(204)
		})

		// QUADRO ORCAMENTARIO
		api.GET("/quadros", func(c *gin.Context) { c.JSON(200, quadros) })
		api.POST("/quadros", func(c *gin.Context) {
			var body QuadroOrcamentario
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			if body.Ativo == false {
				body.Ativo = true
			}
			quadros = append(quadros, body)
			c.JSON(201, body)
		})
		api.DELETE("/quadros/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := quadros[:0]
			for _, e := range quadros {
				if e.ID != id {
					out = append(out, e)
				}
			}
			quadros = out
			c.Status(204)
		})

		// CARGOS
		api.GET("/cargos", func(c *gin.Context) { c.JSON(200, cargos) })
		api.POST("/cargos", func(c *gin.Context) {
			var body Cargo
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			cargos = append(cargos, body)
			c.JSON(201, body)
		})
		api.DELETE("/cargos/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := cargos[:0]
			for _, e := range cargos {
				if e.ID != id {
					out = append(out, e)
				}
			}
			cargos = out
			c.Status(204)
		})

		// FUNCIONARIOS
		api.GET("/funcionarios", func(c *gin.Context) { c.JSON(200, funcionarios) })
		api.POST("/funcionarios", func(c *gin.Context) {
			var body Funcionario
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			if body.Status == "" {
				body.Status = "ativo"
			}
			if err := validateFuncionarioInput(body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			funcionarios = append(funcionarios, body)
			recordMovimentacao(body.ID, nil, body.CentroCustoID, "alocação inicial")
			c.JSON(201, body)
		})
		api.POST("/funcionarios/:id/transferencias-centro", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			var payload struct {
				CentroCustoID int64  `json:"centroCustoId"`
				Observacao    string `json:"observacao"`
			}
			if err := c.BindJSON(&payload); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			var funcIdx int = -1
			for i, f := range funcionarios {
				if f.ID == id {
					funcIdx = i
					break
				}
			}
			if funcIdx == -1 {
				c.JSON(404, gin.H{"error": "funcionário não encontrado"})
				return
			}
			destino := centroCustoByID(payload.CentroCustoID)
			if destino == nil {
				c.JSON(400, gin.H{"error": "centro de custo de destino não encontrado"})
				return
			}
			if !destino.Ativo {
				c.JSON(400, gin.H{"error": "não é permitido transferir para centro de custo inativo"})
				return
			}
			if destino.EstabelecimentoID != funcionarios[funcIdx].EstabelecimentoID {
				c.JSON(400, gin.H{"error": "centro de custo de destino deve pertencer ao mesmo estabelecimento"})
				return
			}
			origemID := funcionarios[funcIdx].CentroCustoID
			funcionarios[funcIdx].CentroCustoID = payload.CentroCustoID
			recordMovimentacao(id, &origemID, payload.CentroCustoID, payload.Observacao)
			c.JSON(200, funcionarios[funcIdx])
		})
		api.DELETE("/funcionarios/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := funcionarios[:0]
			for _, e := range funcionarios {
				if e.ID != id {
					out = append(out, e)
				}
			}
			funcionarios = out
			c.Status(204)
		})

		// TABELAS
		api.GET("/tabelas", func(c *gin.Context) { c.JSON(200, tabelas) })
		api.POST("/tabelas", func(c *gin.Context) {
			var body TabelaSalarial
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			if body.Moeda == "" {
				body.Moeda = "BRL"
			}
			tabelas = append(tabelas, body)
			c.JSON(201, body)
		})
		api.DELETE("/tabelas/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := tabelas[:0]
			for _, e := range tabelas {
				if e.ID != id {
					out = append(out, e)
				}
			}
			tabelas = out
			c.Status(204)
		})

		// AVALIACOES
		api.GET("/avaliacoes", func(c *gin.Context) { c.JSON(200, avaliacoes) })
		api.POST("/avaliacoes", func(c *gin.Context) {
			var body Avaliacao
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			if body.Data == "" {
				body.Data = time.Now().Format("2006-01-02")
			}
			avaliacoes = append(avaliacoes, body)
			c.JSON(201, body)
		})
		api.DELETE("/avaliacoes/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := avaliacoes[:0]
			for _, e := range avaliacoes {
				if e.ID != id {
					out = append(out, e)
				}
			}
			avaliacoes = out
			c.Status(204)
		})

		// TRILHAS
		api.GET("/trilhas", func(c *gin.Context) { c.JSON(200, trilhas) })
		api.POST("/trilhas", func(c *gin.Context) {
			var body Trilha
			if err := c.BindJSON(&body); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			seqID++
			body.ID = seqID
			trilhas = append(trilhas, body)
			c.JSON(201, body)
		})
		api.DELETE("/trilhas/:id", func(c *gin.Context) {
			id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
			out := trilhas[:0]
			for _, e := range trilhas {
				if e.ID != id {
					out = append(out, e)
				}
			}
			trilhas = out
			c.Status(204)
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	_ = r.Run(":" + port)
}
