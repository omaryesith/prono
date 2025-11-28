.PHONY: setup up down build shell test migrate makemigrations logs

# Colors to make it look nice in the terminal
GREEN=\033[0;32m
NC=\033[0m # No Color

help:
	@echo "Available commands for Prono:"
	@echo "${GREEN}make setup${NC}          - Build and initialize everything from scratch"
	@echo "${GREEN}make build${NC}          - Build Docker containers"
	@echo "${GREEN}make up${NC}             - Start services in background"
	@echo "${GREEN}make down${NC}           - Stop all services"
	@echo "${GREEN}make logs${NC}           - Show logs in real-time"
	@echo "${GREEN}make test${NC}           - Run test suite (pytest)"
	@echo "${GREEN}make shell${NC}          - Open Django shell inside the container"
	@echo "${GREEN}make migrate${NC}        - Run database migrations"
	@echo "${GREEN}make makemigrations${NC} - Create new migrations"
	@echo "${GREEN}make clean${NC}          - Clean pycache and remove volumes"

setup: build up migrate
	@echo "${GREEN}Creating Superuser 'admin'...${NC}"
	docker compose run --rm web python manage.py createsuperuser --username admin --email admin@example.com || true

build:
	docker compose build

up-dev:
	docker compose up

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

test:
	docker compose run --rm web pytest

shell:
	docker compose run --rm web python manage.py shell

migrate:
	docker compose run --rm web python manage.py migrate --noinput

makemigrations:
	docker compose run --rm web python manage.py makemigrations

# Useful command to clean pycache files and orphan volumes
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	docker compose down -v
