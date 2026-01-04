# Andara Server

Spring Boot backend for Andara's World.

## Building

```bash
./gradlew build
```

## Running

```bash
./gradlew bootRun
```

The server will start on `http://localhost:8080`

## Module Structure

- `andara-api` - REST controllers and WebSocket handlers
- `andara-application` - Application services and command handlers
- `andara-domain` - Domain model, aggregates, and events
- `andara-infrastructure` - Persistence, Kafka, external services
- `andara-query` - Read models, projections, query services
- `andara-common` - Shared utilities and value objects
- `andara-server-app` - Main application and configuration

## Setup Notes

### Gradle Wrapper

The Gradle wrapper jar needs to be downloaded. Run:

```bash
./gradlew wrapper
```

Or download manually from the Gradle distribution URL specified in `gradle/wrapper/gradle-wrapper.properties`.

### Database

Ensure PostgreSQL is running (via Docker Compose):

```bash
docker-compose up -d postgres
```

### Kafka

Ensure Kafka is running (via Docker Compose):

```bash
docker-compose up -d kafka zookeeper
```


