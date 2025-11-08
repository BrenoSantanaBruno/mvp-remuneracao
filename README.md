```markdown
# MVP Remuneração — Next.js + Go + Docker

Um monorepo didático e produtivo para gestão de **Estrutura Organizacional**, **Cargos**, **Trilhas**, **Funcionários** e **Tabelas Salariais**. O foco é entregar CRUD completo, integração front↔API, feedback ao usuário (toasts), validação de formulários e execução simplificada via Docker.

---

## Sumário
- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Início Rápido (Docker)](#início-rápido-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts úteis](#scripts-úteis)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Endpoints da API](#endpoints-da-api)
- [Modelos (exemplos)](#modelos-exemplos)
- [Padrões do Front-end](#padrões-do-front-end)
- [Testes](#testes)
- [Troubleshooting](#troubleshooting)
- [Roadmap curto](#roadmap-curto)
- [Licença](#licença)

---

## Arquitetura
- **web/** — Front-end **Next.js (App Router)** com **shadcn/ui**, **react-hook-form** e toasts.
- **api/** — API em **Go** (router idiomático, handlers REST, camadas service/repository).
- **db/** — Banco (PostgreSQL por padrão) + migrações.
- **docker-compose.yml** — Orquestração dos serviços.
- **Makefile** — Comandos DX (developer experience) padronizados.

Fluxo padrão:
```

web (Next.js) ──HTTP──► api (Go) ──SQL──► db (Postgres)

````

---

## Stack
- **Front**: Next.js 14+ (App Router), TypeScript, shadcn/ui, react-hook-form, Zod.
- **API**: Go 1.22+, camadas `transport/http`, `service`, `repository` (GORM ou sqlx).
- **DB**: PostgreSQL 15 (com migrações).
- **Infra Dev**: Docker & Docker Compose, Makefile.

---

## Pré-requisitos
- **Docker** e **Docker Compose** instalados.
- (Opcional, para rodar local sem Docker) **Node 18+** e **Go 1.22+**.

---

## Início Rápido (Docker)
> No diretório raiz do projeto:

```bash
# 1) Preparar .envs e dependências
make init

# 2) Subir tudo (web+api+db) com build
make up

# 3) Ver logs agrupados
make logs

# 4) Derrubar ambiente
make down

# 5) Reset total (containers, volumes e imagens do projeto)
make clean
````

URLs padrão:

* Front-end: [http://localhost:3000](http://localhost:3000)
* API: [http://localhost:8080](http://localhost:8080)
* Banco: localhost:5432 (apenas containers se conectam por padrão)

---

## Variáveis de Ambiente

Crie os arquivos abaixo antes de rodar `make up` (o `make init` pode gerar exemplos).

**`api/.env`**

```ini
API_PORT=8080
DB_DRIVER=postgres
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=remuneracao
DB_SSLMODE=disable
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=troque-isto
```

**`web/.env.local`**

```ini
NEXT_PUBLIC_API_URL=http://localhost:8080
# Ajuste conforme necessário
```

**`db/.env`** (se necessário para ferramentas externas)

```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=remuneracao
```

> **MySQL?** Se preferir MySQL, altere `DB_DRIVER=mysql` e ajuste o DSN/serviço no `docker-compose.yml`.

---

## Scripts úteis

Sem Docker (opcional, para desenvolvimento local):

**API**

```bash
cd api
go mod tidy
go run ./cmd/api
go test ./... -v
```

**WEB**

```bash
cd web
npm install      # ou pnpm/yarn
npm run dev
npm run build
npm run lint
```

---

## Estrutura de Pastas

```
.
├─ api/
│  ├─ cmd/api/           # main.go, wiring HTTP
│  ├─ internal/
│  │  ├─ transport/http  # handlers, routers, DTOs
│  │  ├─ service         # casos de uso/regra de negócio
│  │  ├─ repository      # persistência (GORM/sqlx)
│  │  └─ domain          # entidades e contratos
│  └─ migrations/        # arquivos SQL de migração
├─ web/
│  ├─ app/               # App Router (Next.js)
│  ├─ components/        # UI e formulários
│  ├─ lib/               # clients, hooks, schemas
│  └─ public/
├─ db/
│  └─ init/              # seed opcional
├─ docker-compose.yml
├─ Makefile
└─ README.md
```

---

## Endpoints da API

Base: `http://localhost:8080/v1`

**Empresas**

* `GET /empresas` — listar
* `POST /empresas` — criar
* `GET /empresas/{id}` — detalhar
* `PUT /empresas/{id}` — atualizar
* `DELETE /empresas/{id}` — remover

**Cargos**

* `GET /cargos`
* `POST /cargos`
* `GET /cargos/{id}`
* `PUT /cargos/{id}`
* `DELETE /cargos/{id}`

**Trilhas**

* `GET /trilhas`
* `POST /trilhas`
* `GET /trilhas/{id}`
* `PUT /trilhas/{id}`
* `DELETE /trilhas/{id}`

**Funcionários**

* `GET /funcionarios`
* `POST /funcionarios`
* `GET /funcionarios/{id}`
* `PUT /funcionarios/{id}`
* `DELETE /funcionarios/{id}`

**Tabelas Salariais**

* `GET /tabelas-salariais`
* `POST /tabelas-salariais`
* `GET /tabelas-salariais/{id}`
* `PUT /tabelas-salariais/{id}`
* `DELETE /tabelas-salariais/{id}`

> **Observação:** a rota `/health` pode existir para probes (`GET /health`).

### Exemplo `curl` (criar Empresa)

```bash
curl -X POST http://localhost:8080/v1/empresas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Acme S/A",
    "cnpj": "00.000.000/0001-00",
    "descricao": "Holding de tecnologia"
  }'
```

---

## Modelos (exemplos)

> Os nomes/formatos podem variar conforme implementação final.

**Empresa**

```json
{
  "id": "uuid",
  "nome": "Acme S/A",
  "cnpj": "00.000.000/0001-00",
  "descricao": "Holding de tecnologia",
  "createdAt": "2025-11-07T00:00:00Z",
  "updatedAt": "2025-11-07T00:00:00Z"
}
```

**Cargo**

```json
{
  "id": "uuid",
  "empresaId": "uuid",
  "titulo": "Engenheiro de Software Sr",
  "senioridade": "Sênior",
  "faixaSalarial": { "min": 12000, "max": 22000 },
  "descricao": "Backend Go/Cloud",
  "trilhaId": "uuid"
}
```

**Trilha**

```json
{
  "id": "uuid",
  "empresaId": "uuid",
  "nome": "Engenharia",
  "descricao": "Trilha de desenvolvimento para Engenharia"
}
```

**Funcionário**

```json
{
  "id": "uuid",
  "empresaId": "uuid",
  "nome": "Breno Santana",
  "email": "breno@example.com",
  "cargoId": "uuid",
  "salario": 18500
}
```

**Tabela Salarial**

```json
{
  "id": "uuid",
  "empresaId": "uuid",
  "titulo": "Tabela 2025",
  "itens": [
    { "cargoId": "uuid", "nivel": "Pleno", "min": 9000, "max": 14000 },
    { "cargoId": "uuid", "nivel": "Sênior", "min": 14000, "max": 22000 }
  ]
}
```

---

## Padrões do Front-end

* **Formulários**: `react-hook-form` + `zod` para validação.
* **UI**: `shadcn/ui` (Dialog, Button, Input, Select, Toaster).
* **Estados**: `useState`/`useEffect` + fetch ao **NEXT_PUBLIC_API_URL**.
* **UX esperado**:

    * Botões **“Novo”** → abre **Modal**.
    * **Validar** campos → **Salvar** na API.
    * Ao sucesso → **fechar modal**, **atualizar lista**, **toast** de confirmação.
    * Erros → **toast** de erro com mensagem amigável.

---

## Testes

* **API**: `go test ./... -v` (unit/integration).
* **WEB**: testes de componentes com Vitest/RTL (se configurado).

---

## Troubleshooting

* **Porta em uso**: altere `API_PORT`/porta do Next ou finalize processos antigos.
* **Falha ao conectar ao DB**: verifique `DB_HOST=db`, usuário/senha e migrações.
* **CORS**: ajuste `CORS_ORIGINS` para o host do front.
* **Docker “no space left on device”**: limpe imagens/volumes: `docker system prune -af --volumes`.

---

## Roadmap curto

* Autenticação JWT e RBAC por recurso.
* Filtros/paginação/ordenação nas listas.
* Import/Export CSV.
* Relatórios (PDF/Excel) e dashboards.
* Testes E2E (Playwright).

---

## Licença

MIT. Use, estude, modifique e compartilhe com os devidos créditos.

```
```
