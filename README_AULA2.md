# Fullstack (Aula 2) — Next + Go + Docker

## Rodando com Docker
```bash
docker compose up --build
```
- Front: http://localhost:3000
- API:   http://localhost:8080/api/health

## Dev sem Docker
- API:
```bash
cd server && go run .
```
- Front:
```bash
pnpm install && pnpm dev
```

## Observações
- Se já existirem arquivos no projeto, criamos versões `.aula2` para você comparar antes de sobrescrever.
- A API é em memória (ideal para aula).
