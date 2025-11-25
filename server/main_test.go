package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestIsValidCNPJ(t *testing.T) {
	valid := "46.736.982/0001-85"
	if !isValidCNPJ(valid) {
		t.Fatalf("cnpj válido deveria ser aceito: %s", valid)
	}
	invalid := "11.111.111/1111-11"
	if isValidCNPJ(invalid) {
		t.Fatalf("cnpj inválido não deveria ser aceito: %s", invalid)
	}
}

func TestMatrizUnicaPorEmpresa(t *testing.T) {
	existing := []Estabelecimento{{
		ID:                       1,
		EmpresaID:                10,
		Tipo:                     "matriz",
		CNPJ:                     "46.736.982/0001-85",
		CNAE:                     "6201-5/01",
		Cidade:                   "Rio de Janeiro",
		Estado:                   "RJ",
		SindicatoPatronalID:      1,
		SindicatoTrabalhadoresID: 2,
	}}
	body := Estabelecimento{
		EmpresaID:                10,
		Tipo:                     "matriz",
		CNPJ:                     "42.948.383/0001-04",
		CNAE:                     "6201-5/01",
		Cidade:                   "Rio de Janeiro",
		Estado:                   "RJ",
		SindicatoPatronalID:      1,
		SindicatoTrabalhadoresID: 2,
	}
	err := validateEstabelecimentoInput(body, existing, []Empresa{{ID: 10}})
	if err == nil {
		t.Fatalf("deveria bloquear segunda matriz na mesma empresa")
	}
}

func TestCentroCustoInativoBloqueiaFuncionario(t *testing.T) {
	centros = []CentroCusto{{ID: 1, EstabelecimentoID: 99, Codigo: "CC-001", CustomCode: "CC-001", Descricao: "Admin", Ativo: false}}
	estabelecimentos = []Estabelecimento{{ID: 99, EmpresaID: 1, Tipo: "matriz", CNPJ: "46.736.982/0001-85", CNAE: "6201-5/01", Cidade: "Rio", Estado: "RJ", SindicatoPatronalID: 1, SindicatoTrabalhadoresID: 2}}
	funcionario := Funcionario{ID: 1, Nome: "Teste", CentroCustoID: 1, EstabelecimentoID: 99}
	if err := validateFuncionarioInput(funcionario); err == nil {
		t.Fatalf("deveria bloquear alocação em centro inativo")
	}
}

func TestSindicatoObrigatorioEmEstabelecimento(t *testing.T) {
	estabelecimentos = nil
	empresas = []Empresa{{ID: 1, Name: "Empresa", Fantasia: "Fantasia"}}
	body := Estabelecimento{
		EmpresaID: 1,
		Tipo:      "filial",
		CNPJ:      "46.736.982/0001-85",
		CNAE:      "6201-5/01",
		Cidade:    "Rio de Janeiro",
		Estado:    "RJ",
	}
	if err := validateEstabelecimentoInput(body, estabelecimentos, empresas); err == nil {
		t.Fatalf("deveria exigir sindicato patronal e dos trabalhadores")
	}
}

func newTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	api := r.Group("/api")
	{
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
			centros[idx] = body
			c.JSON(200, body)
		})
	}
	return r
}

func TestCentroCustoPUTEndpoint(t *testing.T) {
	estabelecimentos = []Estabelecimento{{ID: 10, EmpresaID: 1, Tipo: "matriz", CNPJ: "46.736.982/0001-85", CNAE: "6201-5/01", Cidade: "Rio", Estado: "RJ", SindicatoPatronalID: 1, SindicatoTrabalhadoresID: 2}}
	centros = []CentroCusto{{ID: 99, EstabelecimentoID: 10, Codigo: "OLD", CustomCode: "OLD", Descricao: "Antigo", Ativo: true}}
	seqID = 100

	router := newTestRouter()
	payload := CentroCusto{Codigo: "CC-009", CustomCode: "CC-009", Descricao: "Atualizado", EstabelecimentoID: 10, Ativo: true}
	b, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPut, "/api/centros/99", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, veio %d, body=%s", w.Code, w.Body.String())
	}
}
