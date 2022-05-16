#
# See `make help` for a list of all available commands.
#

APP_NAME := attack_powered_suit
BIN := node_modules/.bin
TIMESTAMP := $(shell date -u +"%Y%m%d_%H%M%S")
GIT_HASH := $(shell git rev-parse --short HEAD)

.DEFAULT_GOAL := help

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## Install dependencies
	npm install

.PHONY: pre-commit-run
pre-commit-run: test ## Run pre-commit hooks on all files

.PHONY: clean
clean: clean ## Clean up build directory and Node.JS packages
	rm -f public/build node_modules

.PHONY: lint
lint: ## Lint code
	npm run lint

.PHONY: test
test: ## Run tests
	npm run test
