
package main

import (
	"net/http"
	"os"
	"time"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Empresa struct { ID int64 `json:"id"`; Code string `json:"code"`; Name string `json:"name"`; Fantasia string `json:"fantasia"`; CNPJ string `json:"cnpj"`; Status string `json:"status"` }
type Cargo struct { ID int64 `json:"id"`; Titulo string `json:"titulo"`; Area string `json:"area"`; Nivel string `json:"nivel"`; Pontos int `json:"pontos"` }
type Funcionario struct { ID int64 `json:"id"`; Nome string `json:"nome"`; Cargo string `json:"cargo"`; Area string `json:"area"`; Gestor string `json:"gestor"`; Admissao string `json:"admissao"`; Salario float64 `json:"salario"`; Status string `json:"status"` }
type TabelaSalarial struct { ID int64 `json:"id"`; Nome string `json:"nome"`; Cargo string `json:"cargo"`; FaixaMin float64 `json:"faixaMin"`; FaixaMed float64 `json:"faixaMed"`; FaixaMax float64 `json:"faixaMax"`; Moeda string `json:"moeda"` }
type Avaliacao struct { ID int64 `json:"id"`; Cargo string `json:"cargo"`; Nota int `json:"nota"`; Comentario string `json:"comentario"`; Data string `json:"data"` }
type Trilha struct { ID int64 `json:"id"`; Nome string `json:"nome"`; Area string `json:"area"`; Ativa bool `json:"ativa"` }

var seqID int64 = 1000

var empresas = []Empresa{
	{ID:1, Code:"C01", Name:"Acme S.A.", Fantasia:"Acme", CNPJ:"12.345.678/0001-99", Status:"Ativa"},
	{ID:2, Code:"C02", Name:"Globex Ltda", Fantasia:"Globex", CNPJ:"98.765.432/0001-11", Status:"Ativa"},
}
var estabelecimentos = []map[string]any{ {"id":1,"nome":"Matriz"}, {"id":2,"nome":"Filial Rio"} }
var lotacoes = []map[string]any{ {"id":1,"nome":"Operações"}, {"id":2,"nome":"TI"} }
var centros = []map[string]any{ {"id":1,"nome":"CC-001"}, {"id":2,"nome":"CC-002"}, {"id":3,"nome":"CC-003"} }
var unidades = []map[string]any{ {"id":1,"nome":"Unidade 1"}, {"id":2,"nome":"Unidade 2"}, {"id":3,"nome":"Unidade 3"} }

var cargos = []Cargo{
	{ID:10, Titulo:"Analista de Dados Junior", Area:"Tecnologia", Nivel:"Júnior", Pontos:285},
	{ID:11, Titulo:"Gerente de Vendas", Area:"Comercial", Nivel:"Gerente", Pontos:420},
}
var funcionarios = []Funcionario{
	{ID:20, Nome:"João Silva", Cargo:"Analista de Dados Junior", Area:"Tecnologia", Gestor:"CTO", Admissao:"2024-08-15", Salario:5500, Status:"ativo"},
	{ID:21, Nome:"Bruno Lima", Cargo:"Gerente de Vendas", Area:"Comercial", Gestor:"CEO", Admissao:"2023-06-19", Salario:10000, Status:"ativo"},
}
var tabelas = []TabelaSalarial{}
var avaliacoes = []Avaliacao{}
var trilhas = []Trilha{ {ID:30, Nome:"Trilha Comercial", Area:"Comercial", Ativa:true}, {ID:31, Nome:"Trilha Dados", Area:"Tecnologia", Ativa:true} }

func main() {
	r := gin.Default()
	origin := os.Getenv("CORS_ORIGIN")
	if origin == "" { origin = "*" }
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions { c.AbortWithStatus(http.StatusNoContent); return }
		c.Next()
	})

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context){ c.JSON(200, gin.H{"ok":true, "time":time.Now()}) })

		api.GET("/empresas", func(c *gin.Context){ c.JSON(200, empresas) })
		api.POST("/empresas", func(c *gin.Context){
			var body Empresa; if err:=c.BindJSON(&body); err!=nil { c.JSON(400, gin.H{"error":err.Error()}); return }
			seqID++; body.ID = seqID; empresas = append(empresas, body); c.JSON(201, body)
		})
		api.DELETE("/empresas/:id", func(c *gin.Context){
			id,_ := strconv.ParseInt(c.Param("id"),10,64)
			out := empresas[:0]; for _,e := range empresas { if e.ID!=id { out = append(out, e) } }; empresas = out; c.Status(204)
		})

		api.GET("/estabelecimentos", func(c *gin.Context){ c.JSON(200, estabelecimentos) })
		api.GET("/lotacoes", func(c *gin.Context){ c.JSON(200, lotacoes) })
		api.GET("/centros", func(c *gin.Context){ c.JSON(200, centros) })
		api.GET("/unidades", func(c *gin.Context){ c.JSON(200, unidades) })

		api.GET("/cargos", func(c *gin.Context){ c.JSON(200, cargos) })
		api.POST("/cargos", func(c *gin.Context){
			var body Cargo; if err:=c.BindJSON(&body); err!=nil { c.JSON(400, gin.H{"error":err.Error()}); return }
			seqID++; body.ID = seqID; cargos = append(cargos, body); c.JSON(201, body)
		})
		api.DELETE("/cargos/:id", func(c *gin.Context){
			id,_ := strconv.ParseInt(c.Param("id"),10,64)
			out := cargos[:0]; for _,e := range cargos { if e.ID!=id { out = append(out, e) } }; cargos = out; c.Status(204)
		})

		api.GET("/trilhas", func(c *gin.Context){ c.JSON(200, trilhas) })
		api.POST("/trilhas", func(c *gin.Context){
			var body Trilha; if err:=c.BindJSON(&body); err!=nil { c.JSON(400, gin.H{"error":err.Error()}); return }
			seqID++; body.ID = seqID; if body.Area=="" { body.Area = "Geral" }; body.Ativa = true; trilhas = append(trilhas, body); c.JSON(201, body)
		})
		api.DELETE("/trilhas/:id", func(c *gin.Context){
			id,_ := strconv.ParseInt(c.Param("id"),10,64)
			out := trilhas[:0]; for _,e := range trilhas { if e.ID!=id { out = append(out, e) } }; trilhas = out; c.Status(204)
		})

		api.GET("/funcionarios", func(c *gin.Context){ c.JSON(200, funcionarios) })
		api.POST("/funcionarios", func(c *gin.Context){
			var body Funcionario; if err:=c.BindJSON(&body); err!=nil { c.JSON(400, gin.H{"error":err.Error()}); return }
			seqID++; body.ID = seqID; if body.Status=="" { body.Status = "ativo" }; funcionarios = append(funcionarios, body); c.JSON(201, body)
		})
		api.DELETE("/funcionarios/:id", func(c *gin.Context){
			id,_ := strconv.ParseInt(c.Param("id"),10,64)
			out := funcionarios[:0]; for _,e := range funcionarios { if e.ID!=id { out = append(out, e) } }; funcionarios = out; c.Status(204)
		})

		api.GET("/tabelas", func(c *gin.Context){ c.JSON(200, tabelas) })
		api.POST("/tabelas", func(c *gin.Context){
			var body TabelaSalarial; if err:=c.BindJSON(&body); err!=nil { c.JSON(400, gin.H{"error":err.Error()}); return }
			seqID++; body.ID = seqID; if body.Moeda=="" { body.Moeda = "BRL" }; tabelas = append(tabelas, body); c.JSON(201, body)
		})
		api.DELETE("/tabelas/:id", func(c *gin.Context){
			id,_ := strconv.ParseInt(c.Param("id"),10,64)
			out := tabelas[:0]; for _,e := range tabelas { if e.ID!=id { out = append(out, e) } }; tabelas = out; c.Status(204)
		})

		api.GET("/avaliacoes", func(c *gin.Context){ c.JSON(200, avaliacoes) })
		api.POST("/avaliacoes", func(c *gin.Context){
			var body Avaliacao; if err:=c.BindJSON(&body); err!=nil { c.JSON(400, gin.H{"error":err.Error()}); return }
			seqID++; body.ID = seqID; if body.Data=="" { body.Data = time.Now().Format("2006-01-02") }; avaliacoes = append(avaliacoes, body); c.JSON(201, body)
		})
		api.DELETE("/avaliacoes/:id", func(c *gin.Context){
			id,_ := strconv.ParseInt(c.Param("id"),10,64)
			out := avaliacoes[:0]; for _,e := range avaliacoes { if e.ID!=id { out = append(out, e) } }; avaliacoes = out; c.Status(204)
		})
	}

	port := os.Getenv("PORT"); if port=="" { port = "8080" }
	_ = r.Run(":"+port)
}
