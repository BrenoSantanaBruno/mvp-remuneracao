package main

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type Empresa struct {
	ID        int64     `json:"id"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	Fantasia  string    `json:"fantasia"`
	CNPJ      string    `json:"cnpj"`
	Cidade    string    `json:"cidade"`
	Estado    string     `json:"estado"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type Cargo struct {
	ID     int64  `json:"id"`
	Titulo string `json:"titulo"`
	Area   string `json:"area"`
	Nivel  string `json:"nivel"`
	Pontos int    `json:"pontos"`
}

type Funcionario struct {
	ID       int64  `json:"id"`
	Nome     string `json:"nome"`
	Cargo    string `json:"cargo"`
	Area     string `json:"area"`
	Gestor   string `json:"gestor"`
	Admissao string `json:"admissao"`
	Salario  string `json:"salario"`
	Status   string `json:"status"`
}

type Avaliacao struct {
	ID          int64  `json:"id"`
	Funcionario string `json:"funcionario"`
	Pontuacao   int    `json:"pontuacao"`
	Status      string `json:"status"`
}

var (
	empresas     = []Empresa{}
	cargos       = []Cargo{}
	funcionarios = []Funcionario{}
	avaliacoes   = []Avaliacao{}
	seqID  int64 = 1
)

func main() {
	r := gin.Default()

	// CORS simples (aberto para aula)
	r.Use(func(c *gin.Context) {
		origin := os.Getenv("CORS_ORIGIN")
		if origin == "" {
			origin = "*"
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"ok": true, "time": time.Now()})
		})

		api.GET("/empresas", func(c *gin.Context) { c.JSON(http.StatusOK, empresas) })
		api.POST("/empresas", func(c *gin.Context) {
			var body Empresa
			if err := c.BindJSON(&body); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
			body.ID, body.CreatedAt = seqID, time.Now(); seqID++
			empresas = append(empresas, body)
			c.JSON(http.StatusCreated, body)
		})

		api.GET("/cargos", func(c *gin.Context) { c.JSON(http.StatusOK, cargos) })
		api.POST("/cargos", func(c *gin.Context) {
			var body Cargo
			if err := c.BindJSON(&body); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
			body.ID = seqID; seqID++
			cargos = append(cargos, body)
			c.JSON(http.StatusCreated, body)
		})

		api.GET("/funcionarios", func(c *gin.Context) { c.JSON(http.StatusOK, funcionarios) })
		api.POST("/funcionarios", func(c *gin.Context) {
			var body Funcionario
			if err := c.BindJSON(&body); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
			body.ID = seqID; seqID++
			funcionarios = append(funcionarios, body)
			c.JSON(http.StatusCreated, body)
		})

		api.GET("/avaliacoes", func(c *gin.Context) { c.JSON(http.StatusOK, avaliacoes) })
		api.POST("/avaliacoes", func(c *gin.Context) {
			var body Avaliacao
			if err := c.BindJSON(&body); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
			body.ID = seqID; seqID++
			avaliacoes = append(avaliacoes, body)
			c.JSON(http.StatusCreated, body)
		})
	}

	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	_ = r.Run(":" + port)
}
