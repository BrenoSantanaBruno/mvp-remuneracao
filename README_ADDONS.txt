Aula 2 — Add-ons fullstack (Merge-ready)

Extraia este ZIP na raiz do projeto Next.
Conteúdo:
- Dockerfile, docker-compose.yml, .env, .dockerignore, Makefile
- server/ (API Go com Gin)
- lib/api.ts, lib/csv.ts
- components/feature/ReportButton.tsx
- components/pages/RelatoriosPage.tsx
- next.rewrites.sample.mjs (opcional)

Como rodar:
1) make init
2) make up
Front: http://localhost:3000
API:   http://localhost:8080/api/health

Para usar a página de Relatórios, importe e renderize <RelatoriosPage />
no lugar/aba correspondente do seu app.
