## Prerequisites

- JDK 17 (compatible with Spring Boot microservices).[1]
- Maven 3.9+ installé et disponible dans le `PATH`.[1]
- Node.js + npm (version à adapter selon le `package.json` du frontend React).[1]
- Docker Desktop (Windows) ou Docker Engine + Docker Compose v3.8+ (Linux).[1]
- Port locaux libres : 3000 (frontend), 8080 (gateway), 8081 (product), 8082 (order), 9090 (Keycloak), 5433 (PostgreSQL), 5050 (pgAdmin).[1]

***

## Backend & Keycloak

### 1. Cloner le projet

```bash
git clone <url-du-repo> mini-project
cd mini-project
```
(to be adapted according to the actual project configuration)

### 2. Démarrer l’infrastructure Docker (PostgreSQL, Keycloak, Gateway, microservices)

Le projet fournit un `docker-compose.yml` qui orchestre : `ms-postgres`, `ms-keycloak`, `ms-product`, `ms-order`, `ms-gateway`, `ms-pgadmin`.[1]

```bash
# À la racine du projet
docker-compose up -d
```

- PostgreSQL : exposé sur `localhost:5433` vers `ms-postgres:5432`, avec les bases `db_product` et `db_order` initialisées via `./init.sql`.[1]
- Keycloak : `http://localhost:9090` (service `ms-keycloak`, mode dev, realm `mini-project`).[1]
- Product-service : `http://localhost:8081` (service `ms-product`, base `db_product`).[1]
- Order-service : `http://localhost:8082` (service `ms-order`, base `db_order`).[1]
- API Gateway : `http://localhost:8080` (service `ms-gateway`).[1]

Les variables d’environnement (exemples) sont injectées par `docker-compose.yml` : `SPRING_DATASOURCE_URL`, `KEYCLOAK_URL`, etc., pour pointer vers `ms-postgres:5432` et `ms-keycloak:9090`.[1]

Si un lancement local hors Docker est souhaité, adapter les propriétés (`application.yml` / `application.properties`) pour utiliser `localhost` au lieu des hôtes Docker (`ms-postgres`, `ms-keycloak`) :  
```properties
# Exemple indicatif, à adapter
spring.datasource.url=jdbc:postgresql://localhost:5433/db_product
spring.datasource.username=<user>
spring.datasource.password=<password>
keycloak.auth-server-url=http://localhost:9090
```
(to be adapted according to the actual project configuration)[1]

### 3. Migrations / init SQL

Les bases `db_product` et `db_order` sont créées et initialisées par le script `./init.sql` référencé dans `docker-compose.yml` (multi-bases PostgreSQL via `POSTGRES_MULTIPLE_DATABASES`).[1]

- Pour une exécution manuelle (hors Docker), exécuter `init.sql` sur un serveur PostgreSQL local.  
(to be adapted according to the actual project configuration)[1]

### 4. Build et exécution locale des microservices (optionnel, hors Docker)

Depuis chaque dossier de service (`gateway-service`, `product-service`, `order-service`) :[1]

```bash
# Gateway
cd gateway-service
mvn clean package -Dmaven.test.skip=true
java -jar target/*.jar

# Product
cd ../product-service
mvn clean package -Dmaven.test.skip=true
java -jar target/*.jar

# Order
cd ../order-service
mvn clean package -Dmaven.test.skip=true
java -jar target/*.jar
```

Veiller à ce que les ports configurés soient : Gateway 8080, Product 8081, Order 8082, et que les URLs Keycloak/JDBC soient cohérentes (localhost vs ms-xxx).[1]

### 5. Configuration Keycloak (realm, client, utilisateurs)

Une instance Keycloak est exposée sur `http://localhost:9090`, avec un realm nommé `mini-project`.[1]

- Realm : `mini-project` (`http://localhost:9090/realms/mini-project`).[1]
- Client frontend : `ecom-frontend`, `Valid Redirect URIs: http://localhost:3000/*`, origins autorisées `http://localhost:3000`.[1]
- Rôles realm-level : `ADMIN`, `CLIENT`.[1]
- Utilisateurs (exemples dans le rapport) : `admin` (ADMIN), `client` ou `random` (CLIENT), avec des mots de passe configurés dans Keycloak. (to be adapted according to the actual project configuration)[1]

Flux utilisé : OAuth2 Authorization Code + PKCE ; le frontend obtient un `access_token` JWT qui est propagé en header `Authorization: Bearer <token>` vers la Gateway et les microservices.[1]

***

## Frontend (React)

Le frontend est un projet React consommant uniquement l’API Gateway sur `http://localhost:8080`.[1]

### 1. Installation des dépendances

```bash
cd frontend
npm install
```
(to be adapted according to the actual project configuration)[1]

### 2. Configuration environnement frontend

Le frontend appelle :  
- l’API via `http://localhost:8080` (routes `/api/products/**`, `/api/orders/**` protégées JWT).[1]
- Keycloak via le client `ecom-frontend` dans le realm `mini-project` à `http://localhost:9090`.[1]

Selon le projet, configurer un fichier `.env` ou un module de config :  
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_KEYCLOAK_URL=http://localhost:9090
REACT_APP_KEYCLOAK_REALM=mini-project
REACT_APP_KEYCLOAK_CLIENT_ID=ecom-frontend
```
(to be adapted according to the actual project configuration)[1]

### 3. Lancer le frontend

```bash
cd frontend
npm start
```

Le frontend démarre sur `http://localhost:3000` avec CORS configuré pour `http://localhost:3000` côté Gateway (CORS réactif, méthodes GET/POST/PUT/DELETE/OPTIONS, credentials autorisés).[1]

***

## DevSecOps tools

### 1. Analyse statique SonarQube

Un SonarQube communautaire est déployé via Docker dans l’environnement du projet, chaque microservice étant analysé comme projet indépendant via le plugin Maven Sonar Scanner.[1]

- URL SonarQube : `http://localhost:9000` (to be adapted according to the actual project configuration).[1]
- Chaque service possède un projet Sonar dédié (gateway-service, product-service, order-service).[1]

Depuis le dossier de chaque service backend :

```bash
cd gateway-service
mvn clean verify sonar:sonar \
  -Dsonar.login=<SONAR_TOKEN> \
  -Dsonar.host.url=http://localhost:9000

cd ../product-service
mvn clean verify sonar:sonar \
  -Dsonar.login=<SONAR_TOKEN> \
  -Dsonar.host.url=http://localhost:9000

cd ../order-service
mvn clean verify sonar:sonar \
  -Dsonar.login=<SONAR_TOKEN> \
  -Dsonar.host.url=http://localhost:9000
```
(to be adapted according to the actual project configuration)[1]

### 2. Analyse des dépendances (OWASP Dependency-Check)

Le plugin OWASP Dependency-Check est intégré dans les `pom.xml` des services Gateway, Produit et Commande, exécuté durant la phase `verify`.[1]

Depuis chaque service :

```bash
cd gateway-service
mvn clean verify

cd ../product-service
mvn clean verify

cd ../order-service
mvn clean verify
```

Le plugin interroge la base NVD avec une clé API configurée dans Maven et génère les rapports CVE associés aux dépendances (Tomcat, Spring Security, driver PostgreSQL, etc.).[1]

### 3. Scan des images Docker (Trivy)

Après la construction des images Docker (par `docker-compose build` ou équivalent), lancer Trivy pour chaque image.[1]

Exemple (adapter les noms d’images à ceux définis dans `docker-compose.yml`) :[1]

```bash
# À la racine du projet, après build des images
trivy image --timeout 10m --scanners vuln --format table \
  --output trivy-gateway.txt <gateway-image-name>

trivy image --timeout 10m --scanners vuln --format table \
  --output trivy-product.txt <product-image-name>

trivy image --timeout 10m --scanners vuln --format table \
  --output trivy-order.txt <order-image-name>
```

Les rapports `trivy-*.txt` listent les vulnérabilités (LOW, MEDIUM, HIGH, CRITICAL) des paquets systèmes et artefacts Java, avec versions corrigées recommandées.[1]

***

## Accès à l’application

- Frontend : `http://localhost:3000` (page d’accueil E-Shop / MicroStore).[1]
- Login : redirection vers `http://localhost:9090/realms/mini-project/protocol/openid-connect/auth?client_id=ecom-frontend&redirect_uri=http://localhost:3000/...`.[1]
- Gateway (API) : `http://localhost:8080`  
  - Produits : `/api/products/**` (ROLE_ADMIN pour mutation, ROLE_ADMIN/ROLE_CLIENT pour lecture).[1]
  - Commandes : `/api/orders/**`, `/api/orders/my-orders`.[1]
- Keycloak Admin Console : `http://localhost:9090` (compte admin Keycloak).[1]
- PostgreSQL : `localhost:5433` (bases `db_product`, `db_order`).[1]

Utilisateurs et mots de passe exacts sont définis dans la configuration Keycloak du realm `mini-project` (to be adapted according to the actual project configuration).[1]

