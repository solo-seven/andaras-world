.PHONY: test test-backend test-frontend build build-backend build-frontend all clean help

# Default target
all: test build

# Test targets
test: test-backend test-frontend
	@echo "✓ All tests passed"

test-backend:
	@echo "Running backend tests..."
	@cd andara-server && \
		if [ ! -f gradle/wrapper/gradle-wrapper.jar ]; then \
			echo "Gradle wrapper jar not found. Attempting to download..."; \
			if command -v gradle >/dev/null 2>&1; then \
				gradle wrapper --no-daemon; \
			else \
				echo "Error: Gradle wrapper jar missing. Please run: cd andara-server && gradle wrapper"; \
				echo "Or install Gradle and run: gradle wrapper"; \
				exit 1; \
			fi; \
		fi && \
		./gradlew test --no-daemon
	@echo "✓ Backend tests passed"

test-frontend:
	@echo "Running frontend tests..."
	@cd andara-client && \
		if [ ! -d node_modules ]; then \
			echo "Installing dependencies..."; \
			npm install; \
		fi && \
		npm test -- --run
	@echo "✓ Frontend tests passed"

# Build targets
build: build-backend build-frontend
	@echo "✓ All Docker builds completed successfully"

build-backend:
	@echo "Building backend Docker image..."
	@docker build -t andara-server:latest -f andara-server/Dockerfile andara-server/
	@echo "✓ Backend Docker image built successfully"

build-frontend:
	@echo "Building frontend Docker image..."
	@docker build -t andara-client:latest -f andara-client/Dockerfile andara-client/
	@echo "✓ Frontend Docker image built successfully"

# Clean targets
clean:
	@echo "Cleaning build artifacts..."
	@cd andara-server && ./gradlew clean --no-daemon || true
	@cd andara-client && rm -rf dist node_modules/.vite || true
	@echo "✓ Clean completed"

# Help target
help:
	@echo "Available targets:"
	@echo "  make all           - Run all tests then build all Docker images"
	@echo "  make test          - Run all unit tests (backend + frontend)"
	@echo "  make test-backend  - Run backend unit tests"
	@echo "  make test-frontend - Run frontend unit tests"
	@echo "  make build         - Build all Docker images"
	@echo "  make build-backend - Build backend Docker image"
	@echo "  make build-frontend- Build frontend Docker image"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make help          - Show this help message"

