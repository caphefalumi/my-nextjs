.PHONY: help install install-backend install-frontend build build-backend build-frontend start start-backend start-frontend dev dev-backend dev-frontend test test-backend test-frontend lint lint-backend lint-frontend format format-backend clean clean-backend clean-frontend

# Default target
.DEFAULT_GOAL := help

# Variables
BACKEND_DIR := backend
FRONTEND_DIR := frontend
NODE_MODULES_BACKEND := $(BACKEND_DIR)/node_modules
NODE_MODULES_FRONTEND := $(FRONTEND_DIR)/node_modules

# Help target
help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation targets
install: install-backend install-frontend ## Install dependencies for both projects

install-backend: ## Install backend dependencies
	@echo "Installing backend dependencies..."
	cd $(BACKEND_DIR) && yarn install

install-frontend: ## Install frontend dependencies
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && yarn install

# Build targets
build: build-backend build-frontend ## Build both projects

build-backend: ## Build backend project
	@echo "Building backend..."
	cd $(BACKEND_DIR) && yarn build

build-frontend: ## Build frontend project
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && yarn build

# Development targets
dev: dev-backend dev-frontend ## Run both projects in development mode (parallel)

dev-backend: ## Run backend in development mode
	@echo "Starting backend in development mode..."
	cd $(BACKEND_DIR) && yarn start:dev

dev-frontend: ## Run frontend in development mode
	@echo "Starting frontend in development mode..."
	cd $(FRONTEND_DIR) && yarn dev

# Start targets (production)
start: start-backend start-frontend ## Start both projects in production mode (parallel)

start-backend: build-backend ## Start backend in production mode
	@echo "Starting backend in production mode..."
	cd $(BACKEND_DIR) && yarn start:prod

start-frontend: build-frontend ## Start frontend in production mode
	@echo "Starting frontend in production mode..."
	cd $(FRONTEND_DIR) && yarn start

# Test targets
test: test-backend test-frontend ## Run tests for both projects

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	cd $(BACKEND_DIR) && yarn test

test-frontend: ## Run frontend tests (if available)
	@echo "Running frontend tests..."
	cd $(FRONTEND_DIR) && yarn test || echo "No test script found in frontend"

# Lint targets
lint: lint-backend lint-frontend ## Lint both projects

lint-backend: ## Lint backend code
	@echo "Linting backend..."
	cd $(BACKEND_DIR) && yarn lint

lint-frontend: ## Lint frontend code
	@echo "Linting frontend..."
	cd $(FRONTEND_DIR) && yarn lint

# Format targets
format: format-backend ## Format code (backend only)

format-backend: ## Format backend code
	@echo "Formatting backend code..."
	cd $(BACKEND_DIR) && yarn format

# Clean targets
clean: clean-backend clean-frontend ## Clean build artifacts and dependencies for both projects

clean-backend: ## Clean backend build artifacts and dependencies
	@echo "Cleaning backend..."
	rm -rf $(BACKEND_DIR)/dist
	rm -rf $(BACKEND_DIR)/coverage
	rm -rf $(BACKEND_DIR)/node_modules

clean-frontend: ## Clean frontend build artifacts and dependencies
	@echo "Cleaning frontend..."
	rm -rf $(FRONTEND_DIR)/.next
	rm -rf $(FRONTEND_DIR)/node_modules

# Quick setup target
setup: install build ## Install dependencies and build both projects

