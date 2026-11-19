COMPOSE := docker compose

.DEFAULT_GOAL := help

.PHONY: help setup-local dev-local test-local docker-up docker-dev docker-down docker-stop docker-logs docker-restart docker-db docker-install docker-migrate docker-seed docker-fresh docker-test docker-shell docker-tools

help:
	@printf 'Uso: make <alvo>\n\n'
	@printf 'Local (PHP + Node + MySQL na maquina):\n'
	@printf '  setup-local      Instala dependencias, gera chave e roda as migracoes\n'
	@printf '  dev-local        Sobe Laravel, fila e Vite (composer dev)\n'
	@printf '  test-local       Roda os testes (composer test)\n\n'
	@printf 'Docker:\n'
	@printf '  docker-up        Sobe app + MySQL em segundo plano (com build)\n'
	@printf '  docker-dev       Sobe em primeiro plano e mostra os logs\n'
	@printf '  docker-down      Para os containers (mantem os dados)\n'
	@printf '  docker-stop      Para os containers sem remove-los\n'
	@printf '  docker-logs      Acompanha os logs\n'
	@printf '  docker-restart   Reinicia os containers\n'
	@printf '  docker-db        Sobe somente o MySQL (util para desenvolvimento local)\n'
	@printf '  docker-install   Reinstala dependencias PHP/Node dentro do container\n'
	@printf '  docker-migrate   Roda as migracoes dentro do container\n'
	@printf '  docker-seed      Roda os seeders dentro do container\n'
	@printf '  docker-fresh     Recria tudo do zero (APAGA os volumes)\n'
	@printf '  docker-test      Roda os testes dentro do container\n'
	@printf '  docker-shell     Abre um shell no container da aplicacao\n'
	@printf '  docker-tools     Sobe o phpMyAdmin em http://localhost:8080\n'

setup-local:
	composer install
	@test -f .env || cp .env.example .env
	php artisan key:generate --force
	php artisan migrate --force
	npm ci
	npm run build
	php artisan storage:link

dev-local:
	composer dev

test-local:
	composer test

docker-up:
	$(COMPOSE) up -d --build

docker-dev:
	$(COMPOSE) up --build

docker-down:
	$(COMPOSE) down

docker-stop:
	$(COMPOSE) stop

docker-logs:
	$(COMPOSE) logs -f

docker-restart:
	$(COMPOSE) restart

docker-db:
	$(COMPOSE) up -d db

docker-install:
	$(COMPOSE) exec app sh -c "composer install --no-interaction && npm ci && npm run build"

docker-migrate:
	$(COMPOSE) exec app php artisan migrate --force

docker-seed:
	$(COMPOSE) exec app php artisan db:seed --force

docker-fresh:
	$(COMPOSE) down -v
	$(COMPOSE) up -d --build

docker-test:
	$(COMPOSE) exec app php artisan test

docker-shell:
	$(COMPOSE) exec app sh

docker-tools:
	$(COMPOSE) --profile tools up -d phpmyadmin
