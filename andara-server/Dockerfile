FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copy Gradle files
COPY build.gradle settings.gradle gradle.properties ./
COPY gradle/wrapper ./gradle/wrapper
COPY gradlew ./
RUN chmod +x gradlew

# Create module directories and copy build.gradle files (for dependency caching)
RUN mkdir -p andara-api andara-application andara-domain andara-infrastructure andara-query andara-common andara-server-app

COPY andara-api/build.gradle ./andara-api/
COPY andara-application/build.gradle ./andara-application/
COPY andara-domain/build.gradle ./andara-domain/
COPY andara-infrastructure/build.gradle ./andara-infrastructure/
COPY andara-query/build.gradle ./andara-query/
COPY andara-common/build.gradle ./andara-common/
COPY andara-server-app/build.gradle ./andara-server-app/

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy all source code
COPY andara-api/src ./andara-api/src
COPY andara-application/src ./andara-application/src
COPY andara-domain/src ./andara-domain/src
COPY andara-infrastructure/src ./andara-infrastructure/src
# andara-query may not have src directory yet - create empty structure
RUN mkdir -p ./andara-query/src/main/java ./andara-query/src/main/resources
COPY andara-common/src ./andara-common/src
COPY andara-server-app/src ./andara-server-app/src

# Build the application
RUN ./gradlew build --no-daemon -x test

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR (copy to temp dir first, then move to avoid wildcard issues)
COPY --from=build /app/andara-server-app/build/libs/*.jar /tmp/
RUN JAR_FILE=$(find /tmp -name "*.jar" ! -name "*-plain.jar" | head -n 1) && \
    if [ -z "$JAR_FILE" ]; then \
        echo "Error: No JAR file found in build/libs"; \
        exit 1; \
    fi && \
    mv "$JAR_FILE" /app/app.jar && \
    echo "Successfully copied JAR to /app/app.jar"

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

