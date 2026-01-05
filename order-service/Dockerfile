# --- Étape 1 : Build (Compilation avec Maven) ---
# On utilise une image qui contient déjà Maven et Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# On copie les fichiers du projet dans l'image
COPY pom.xml .
COPY src ./src

# On lance la compilation (cela crée le dossier target DANS l'image)
RUN mvn clean package -Dmaven.test.skip=true
# --- Étape 2 : Run (Exécution légère) ---
# On repart d'une image vide et légère juste pour lancer l'app
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# On copie le .jar généré à l'étape 1 (build) vers l'étape 2
COPY --from=build /app/target/*.jar app.jar

# On lance l'application
ENTRYPOINT ["java", "-jar", "app.jar"]