.DEFAULT_GOAL := help
ESC := $(shell printf '\033')
BOLD := $(ESC)[1m
INFO := $(ESC)[0;34m
NC := $(ESC)[0m

define banner
	@echo "$(BOLD)$(1)--------------------------------------------"
	@echo "$(2)"
	@echo "--------------------------------------------$(NC)"
endef

.PHONY: help
help: ## Show this help
	$(call banner,$(INFO),Available targets:)
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: generate
generate: ## Generate prisma client
	$(call banner,$(INFO),Generating Prisma Client...)
	npx prisma generate

.PHONY: push
push: ## Push prisma schema to database
	$(call banner,$(INFO),Pushing Prisma Schema to Database...)
	npx prisma db push

.PHONY: studio
studio: ## Open Prisma Studio
	$(call banner,$(INFO),Opening Prisma Studio...)
	npx prisma studio

.PHONY: reset
reset: ## Reset database (drops all data)
	$(call banner,$(INFO),Resetting Database and execute seed...)
	npx prisma db push --force-reset && npm run db:seed

.PHONY: dev
dev: ## Start development server with hot-reload
	$(call banner,$(INFO),Starting Development Server...)
	npm run dev

.PHONY: build
build: ## Build the project
	$(call banner,$(INFO),Building the Project...)
	npm run build

.PHONY: install
install: ## Install dependencies
	$(call banner,$(INFO),Installing Dependencies...)
	npm install

.PHONY: lint
lint: ## Lint the codebase
	$(call banner,$(INFO),Linting the Codebase...)
	npm run lint