COMPOSE ?= docker compose

.PHONY: init build up down restart logs ps sh-web sh-api prune

init:
	@test -f .env || echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env
	@echo "OK: .env pronto"

build:
	$(COMPOSE) build --no-cache

up:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down && $(COMPOSE) up --build

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

sh-web:
	$(COMPOSE) exec web sh || echo "web ainda não está no ar"

sh-api:
	$(COMPOSE) exec api sh || echo "api ainda não está no ar"

prune:
	$(COMPOSE) down -v --remove-orphans
