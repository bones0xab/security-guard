FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Cache Maven deps
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

# 🔥 DEBUG : logs complets + skip tests
RUN mvn clean package -DskipTests -e -X || (echo "Maven failed" && exit 1)

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 1337
ENTRYPOINT ["java", "-jar", "app.jar"]
