# ============================================================
# StepUp Backend — Dockerfile
# Java 25 / Spring Boot 4.0.6
# Compatible con Railway
# ============================================================

# --- Build stage ---
FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

# curl es necesario para que Maven Wrapper pueda descargar Maven
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar wrapper y pom primero para aprovechar caché de capas
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Descargar dependencias
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B --no-transfer-progress

# Copiar fuentes y construir
COPY src/ src/
RUN ./mvnw package -DskipTests -B --no-transfer-progress

# --- Runtime stage ---
FROM eclipse-temurin:25-jre

WORKDIR /app

# Usuario no-root por seguridad
RUN groupadd -r stepup && useradd -r -g stepup stepup

# Copiar el jar desde el stage de build
COPY --from=builder /app/target/*.jar app.jar

RUN chown stepup:stepup app.jar
USER stepup

EXPOSE 8080

ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
