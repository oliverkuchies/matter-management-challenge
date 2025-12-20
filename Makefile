# Database reset SQL command (reusable)
define TRUNCATE_SQL
TRUNCATE TABLE ticketing_cycle_time_histories CASCADE; \
TRUNCATE TABLE ticketing_ticket_field_value CASCADE; \
TRUNCATE TABLE ticketing_ticket CASCADE; \
TRUNCATE TABLE ticketing_field_status_options CASCADE; \
TRUNCATE TABLE ticketing_field_options CASCADE; \
TRUNCATE TABLE ticketing_field_status_groups CASCADE; \
TRUNCATE TABLE ticketing_fields CASCADE; \
TRUNCATE TABLE ticketing_currency_field_options CASCADE; \
TRUNCATE TABLE ticketing_board CASCADE; \
TRUNCATE TABLE users RESTART IDENTITY CASCADE; \
TRUNCATE TABLE accounts RESTART IDENTITY CASCADE;
endef

.PHONY: help up down dev logs clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start production environment
	docker compose up --build

down: ## Stop all services
	docker compose down

dev: ## Start development environment with hot reload
	docker compose -f docker-compose.dev.yml up -d

logs: ## Tail logs from all services
	docker compose logs -f

logs-backend: ## Tail backend logs only
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs only
	docker compose logs -f frontend

clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all

test-backend: ## Run backend tests
	cd backend && npm test

test-backend-coverage: ## Run backend tests with coverage
	cd backend && npm run test:coverage

seed: ## Re-run database seed (useful for development)
	docker compose restart seed

db-dump: ## Dump database data to file
	@echo "Dumping database..."
	docker compose exec -T postgres pg_dump -U matter -d matter_db --data-only --inserts > database/dump.sql
	@echo "Database dumped to database/dump.sql"

db-reset: ## Drop all data from dev database tables (keeps schema)
	@echo "Resetting dev database..."
	docker compose -f docker-compose.dev.yml exec -T postgres psql -U matter -d matter_db -c "$(TRUNCATE_SQL)"
	@echo "Dev database tables cleared"

db-reseed: db-reset ## Clear database and reseed with fresh data
	docker compose restart seed

db-reseed-dev: db-reset-dev ## Clear dev database and reseed with fresh data
	@echo "Reseeding dev database..."
	@echo "Waiting for database to be ready..."
	@docker compose -f docker-compose.dev.yml exec postgres pg_isready -U matter -d matter_db > /dev/null 2>&1 || true
	docker compose -f docker-compose.dev.yml run --rm -e DATABASE_URL=postgres://matter:matter@postgres:5432/matter_db seed node seed.js
	@echo "Dev database reseeded successfully"

health: ## Check health of all services
	@echo "Checking backend health..."
	@curl -s http://localhost:3000/health | json_pp || echo "Backend unhealthy"
	@echo "\nChecking frontend..."
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "Frontend unhealthy"
	@echo "\nChecking database..."
	@docker compose exec postgres pg_isready -U matter || echo "Database unhealthy"

install: ## Install dependencies for local development
	cd backend && npm install
	cd frontend && npm install
	cd database && npm install

