package main

import (
	"net/http"
	"os"
	"time"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Empresa struct {
	ID       int64  `json:"id"`
	Code     string `json:"code"`
	Name     string `json:"name"`
	Fantasia string `json:"fantasia"`
	Status   string `json:"status"`
}

type Estabelecimento struct {
	ID         int64  `json:"id"`
	EmpresaID  int64  `json:"empresaId"`
	Codigo     string `json:"codigo"`
	Tipo       string `json:"tipo"` // matriz ou filial
	CNPJ       string `json:"cnpj"`
	CNAE       string `json:"cnae"`
	Endereco   string `json:"endereco"`
	Cidade     string `json:"cidade"`
	Estado     string `json:"estado"`
	Ativo      bool   `json:"ativo"`
}

type CentroCusto struct {
	ID               int64  `json:"id"`
	EstabelecimentoID int64 `json:"estabelecimentoId"`
	Codigo           string `json:"codigo"`
	Descricao        string `json:"descricao"`
	Subdivisao       string `json:"subdivisao"`
	Ativo            bool   `json:"ativo"`
}

type Sindicato struct {
	ID                 int64  `json:"id"`
	Nome               string `json:"nome"`
	Tipo               string `json:"tipo"` // patronal ou trabalhadores
	Cidade             string `json:"cidade"`
	UF                 string `json:"uf"`
	SindicatoPatronalID int64 `json:"sindicatoPatronalId"`
	Ativo              bool   `json:"ativo"`
}

type Convencao struct {
	ID                      int64  `json:"id"`
	SindicatoTrabalhadoresID int64 `json:"sindicatoTrabalhadoresId"`
	SindicatoPatronalID      int64 `json:"sindicatoPatronalId"`
	CNAE                    string `json:"cnae"`
	Cidade                  string `json:"cidade"`
	UF                      string `json:"uf"`
	VigenciaInicio          string `json:"vigenciaInicio"`
	VigenciaFim             string `json:"vigenciaFim"`
	DocumentoURL            string `json:"documentoUrl"`
	Observacoes             string `json:"observacoes"`
}

type QuadroOrcamentario struct {
	ID               int64   `json:"id"`
	EstabelecimentoID int64  `json:"estabelecimentoId"`
	CentroCustoID    int64   `json:"centroCustoId"`
	Ano              int     `json:"ano"`
	Mes              int     `json:"mes"`
	ValorOrcado      float64 `json:"valorOrcado"`
	Observacao       string  `json:"observacao"`
	Ativo            bool    `json:"ativo"`
}

type Cargo struct {
	ID     int64  `json:"id"`
	Titulo string `json:"titulo"`
	Area   string `json:"area"` // agora será o centro de custo
	Nivel  string `json:"nivel"`
	Pontos int    `json:"pontos"`
}

type Funcionario struct {
	ID               int64   `json:"id"`
	Nome             string  `json:"nome"`
	Cargo            string  `json:"cargo"`
	EstabelecimentoID int64  `json:"estabelecimentoId"`
	CentroCustoID    int64   `json:"centroCustoId"`
	Gestor           string  `json:"gestor"`
	Admissao         string  `json:"admissao"`
	Salario          float64 `json:"salario"`
	Status           string  `json:"status"`
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

var empresas = []Empresa{
	{ID: 1, Code: "EMP001", Name: "Empresa Exemplo", Fantasia: "Exemplo", Status: "Ativa"},
}

var estabelecimentos = []Estabelecimento{
	{ID: 1, EmpresaID: 1, Codigo: "EST001", Tipo: "matriz", CNPJ: "46.736.982/0001-85", CNAE: "6201-5/01", Endereco: "Rua Central, 100", Cidade: "Rio de Janeiro", Estado: "RJ", Ativo: true},
}

var centros = []CentroCusto{
	{ID: 1, EstabelecimentoID: 1, Codigo: "CC-001", Descricao: "Administrativo", Subdivisao: "01", Ativo: true},
	{ID: 2, EstabelecimentoID: 1, Codigo: "CC-002", Descricao: "TI", Subdivisao: "02", Ativo: true},
}

var sindicatos = []Sindicato{
	{ID: 1, Nome: "Sindicato Patronal RJ", Tipo: "patronal", Cidade: "Rio de Janeiro", UF: "RJ", Ativo: true},
	{ID: 2, Nome: "Sindicato dos Trabalhadores RJ", Tipo: "trabalhadores", Cidade: "Rio de Janeiro", UF: "RJ", SindicatoPatronalID: 1, Ativo: true},
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

var tabelas = []TabelaSalarial{}
var avaliacoes = []Avaliacao{}
var trilhas = []Trilha{
	{ID: 30, Nome: "Trilha Comercial", Area: "CC-001", Ativa: true},
}

func main() {
	r := gin.Default()

	origin := os.Getenv("CORS_ORIGIN")
	if origin == "" {
		origin = "*"
	}
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
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
			seqID++
			body.ID = seqID
			if body.Status == "" {
				body.Status = "Ativa"
			}
			empresas = append(empresas, body)
			c.JSON(201, body)
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
			seqID++
			body.ID = seqID
			if body.Ativo == false {
				body.Ativo = true
			}
			estabelecimentos = append(estabelecimentos, body)
			c.JSON(201, body)
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
			seqID++
			body.ID = seqID
			if body.Ativo == false {
				body.Ativo = true
			}
			centros = append(centros, body)
			c.JSON(201, body)
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
			funcionarios = append(funcionarios, body)
			c.JSON(201, body)
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
