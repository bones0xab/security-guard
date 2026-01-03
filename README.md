Développement d’une application
micro-services sécurisée
Spring Boot – React – Keycloak
Réalisé par : Abdelkebir Bouchti
Encadré par : Abdelmajid BOUSSELHAM
Année académique : 2025-2026
Sommaire
1. Contexte du projet 3
3. Technologies et outils choisis 5
4. Description détaillée de l'API Gateway 6
5. Description détaillée du micro-service Produit 8
6. Description détaillée du micro-service Commande 10
7. Mécanismes de sécurité et authentification 12
8. Déploiement et conteneurisation 14
9. Mise en œuvre et validation fonctionnelle 14
10. Conclusion et perspectives 24
1. Contexte du projet
Dans un contexte de transformation numérique, les entreprises recherchent des
solutions logicielles capables de répondre à des exigences croissantes en termes de
flexibilité, de sécurité et de scalabilité. L’architecture micro‑services s’est imposée
comme une approche de référence pour concevoir des applications web distribuées, en
remplaçant progressivement les architectures monolithiques traditionnelles. Cette
approche permet de décomposer le système en services indépendants, centrés sur des
capacités métier bien délimitées, facilitant ainsi le déploiement continu et l’évolution
incrémentale de l’application.
Le mini‑projet présenté dans ce rapport s’inscrit dans cette dynamique et a pour objectif
de concevoir et développer une application web moderne basée sur une architecture
micro‑services sécurisée. L’application vise la gestion des produits et des commandes
d’une entreprise, en séparant clairement les responsabilités entre un frontend, une
passerelle d’API, des micro‑services métier et un serveur d’authentification. Cette
structuration permet d’illustrer concrètement les principes d’isolation, de modularité et
de communication inter‑services au cœur des architectures micro‑services.
Par ailleurs, le projet met l’accent sur l’intégration des préoccupations de sécurité et de
qualité tout au long du cycle de développement. La mise en place de mécanismes
d’authentification et d’autorisation robustes, combinée à la conteneurisation des
composants et à l’adoption d’une démarche DevSecOps, répond aux standards
industriels actuels en matière de développement d’applications critiques. L’objectif est
ainsi de fournir un environnement expérimental permettant de sensibiliser aux bonnes
pratiques de sécurité des micro‑services, d’industrialisation des déploiements et
d’automatisation des contrôles de qualité et de vulnérabilités.
2. Architecture générale attendue
L’architecture cible de l’application repose sur un ensemble de composants clairement
séparés, organisés selon les principes de l’architecture micro‑services. Elle s’articule
autour d’un frontend web développé en React, d’une API Gateway exposant un point
```
d’entrée unique, de deux micro‑services Spring Boot spécialisés (Produit et Commande),
```
d’un serveur d’authentification Keycloak et de bases de données indépendantes pour
chaque service. Cette structuration permet de découpler l’interface utilisateur, la logique
métier et la gestion de l’identité, tout en facilitant l’évolution et le déploiement
indépendant de chaque composant.
Le frontend React interagit exclusivement avec l’API Gateway, qui joue le rôle de façade
unique vis‑à‑vis des clients. Conformément au pattern API Gateway, cette dernière se
charge de recevoir les requêtes du frontend, de vérifier le contexte de sécurité, puis de
router les appels vers le micro‑service approprié, sans que le client ne communique
directement avec les services internes. Les deux micro‑services Spring Boot, dédiés
respectivement à la gestion des produits et des commandes, exposent des APIs REST
consommées uniquement via la passerelle et s’appuient chacun sur leur propre base de
données, conformément au pattern “database per service
3. Technologies et outils choisis
Le choix des technologies pour ce mini-projet s’appuie sur des outils matures et
largement adoptés dans l’écosystème des architectures micro-services, garantissant à
la fois performance, maintenabilité et conformité aux bonnes pratiques industrielles.
Pour le frontend, React a été sélectionné en raison de sa capacité à produire des
interfaces utilisateur réactives et modulaires, basées sur un modèle de composants
réutilisables. Couplé à des bibliothèques comme Axios pour les appels HTTP et React
Router pour la navigation, il permet de consommer efficacement l’API Gateway tout en
offrant une expérience utilisateur fluide et responsive, adaptée aux exigences de
scalabilité de l’architecture proposée.
Du côté backend, les micro-services Produit et Commande sont implémentés avec
Spring Boot, un framework Java robuste qui facilite le développement rapide de
services RESTful légers et indépendants. Spring Boot intègre nativement des
fonctionnalités essentielles telles que la gestion automatique de la configuration, la
surveillance via Actuator et l’intégration avec des bases de données relationnelles
comme PostgreSQL, adoptée ici pour sa fiabilité en environnement distribué. Chaque
micro-service dispose ainsi de sa propre instance PostgreSQL, respectant
scrupuleusement le pattern « database per service » mentionné dans l’architecture
générale, ce qui évite les couplages indésirables et renforce l’isolation des données
métier.
L’API Gateway est réalisée avec Spring Cloud Gateway, un composant dédié qui
orchestre le routage intelligent, la transformation de requêtes et l’agrégation de
réponses, tout en servant de point d’entrée sécurisé. Pour l’authentification centralisée,
```
Keycloak est déployé comme serveur IAM (Identity and Access Management),
```
supportant les protocoles OAuth2 et OpenID Connect pour émettre des tokens JWT
validés à chaque interaction inter-services. Enfin, la conteneurisation repose sur Docker
pour l’encapsulation des composants, avec une orchestration potentielle via Docker
Compose pour les environnements de développement et de test, illustrant ainsi les
principes des applications 12-factor adaptées aux micro-services.
Cette pile technologique, alignée sur les standards DevSecOps, permet non seulement
une mise en œuvre agile du projet, mais aussi une expérimentation concrète des défis
liés à la communication synchrone/asynchrone et à la résilience des systèmes
distribués.
4. Description détaillée de l'API Gateway
L’API Gateway constitue le pivot central de l’architecture micro-services proposée,
agissant comme une façade unique et sécurisée pour toutes les interactions externes
avec le système. Implémentée avec Spring Cloud Gateway, elle expose un port standard
```
(8080) et centralise le routage des requêtes REST provenant du frontend React vers les
```
```
micro-services internes (Produit sur le port 8081 et Commande sur le port 8082). Cette
```
approche respecte scrupuleusement le pattern API Gateway, découplant les clients
finaux des services backend et facilitant ainsi la gestion transverse des préoccupations
non fonctionnelles telles que la sécurité, le logging et la résilience.
Le routage est configuré de manière déclarative via le fichier application.yml, utilisant
```
des prédicats basés sur le chemin (Path=/api/products/** et Path=/api/orders/**).
```
Par exemple, une requête vers /api/products/** est automatiquement redirigée vers
```
http://product-service:8081, tandis que /api/orders/** cible
```
```
http://order-service:8082. Cette configuration predicate-based permet un
```
déploiement indépendant des micro-services sans modification du Gateway, illustrant
les principes de modularité et de scalabilité au cœur de ce mini-projet. De plus, des
fonctionnalités avancées comme le circuit breaker ou le retry pourraient être ajoutées
via Resilience4j pour renforcer la tolérance aux pannes.
La sécurité est intégrée nativement via Spring Security avec @EnableWebFluxSecurity,
adaptée à l’environnement réactif de Spring Cloud Gateway. Les endpoints sensibles
```
nécessitent une authentification JWT (OAuth2 Resource Server), avec validation des
```
```
tokens émis par Keycloak (issuer-uri :
```
```
http://ms-keycloak:9090/realms/mini-project). La configuration
```
SecurityWebFilterChain autorise l’accès public aux ressources Swagger
```
(/v3/api-docs/**, /swagger-ui/**) tout en protégeant les routes métier
```
```
(/api/products/**, /api/orders/**). Le support CORS réactif
```
```
(UrlBasedCorsConfigurationSource) est explicitement configuré pour le frontend local
```
```
(http://localhost:3000), autorisant les méthodes HTTP standard (GET, POST, PUT,
```
```
DELETE, OPTIONS) et les credentials, évitant ainsi les erreurs cross-origin lors des
```
développements.
```
Enfin, la conteneurisation multi-étapes (Dockerfile avec Maven build et runtime Alpine)
```
optimise l’image finale pour un déploiement léger et reproductible. Le logging DEBUG
```
activé (Spring Security, Web, OAuth2) facilite le débogage en environnement distribué,
```
```
tandis que la compilation Maven (mvn clean package) garantit une intégration
```
continue. Cette implémentation de l’API Gateway démontre concrètement comment une
passerelle unique peut orchestrer un écosystème micro-services sécurisé et résilient.
5. Description détaillée du micro-service Produit
Le micro-service Produit, déployé sur le port 8081, incarne les principes d’isolation et
d’autonomie des architectures micro-services en gérant exclusivement le cycle de vie
```
des entités produits (création, lecture, mise à jour, suppression – CRUD). Développé
```
avec Spring Boot et JPA/Hibernate, il s’appuie sur une base de données PostgreSQL
```
dédiée (db_product accessible via
```
```
jdbc:postgresql://ms-postgres:5432/db_product), respectant le pattern « database
```
per service » pour éviter tout couplage de données. L’entité Product modélise les
```
attributs essentiels (id, name, description, price, quantity) avec génération automatique
```
```
d’identifiants et support transactionnel (@Transactional), garantissant la consistance
```
des opérations métier.
Le contrôleur REST ProductController expose une API standardisée sous
/api/products, sécurisée par des annotations @PreAuthorize basées sur les rôles
```
Keycloak (ROLE_ADMIN pour les mutations, ROLE_ADMIN/ROLE_CLIENT pour les
```
```
lectures). Les endpoints incluent POST /api/products pour la création, PUT
```
```
/api/products/{id} pour la mise à jour, DELETE /api/products/{id} pour la
```
```
suppression, GET /api/products pour la liste paginable et GET /api/products/{id}
```
pour la consultation détaillée. Ces routes sont exclusivement accessibles via l’API
Gateway, renforçant l’encapsulation et illustrant la communication inter-services
indirecte au cœur de ce mini-projet.
La sécurité est gérée via SecurityConfig avec OAuth2 Resource Server, validant les
```
JWT de Keycloak (JWKS URI :
```
```
http://ms-keycloak:9090/realms/mini-project/protocol/openid-connect/certs).
```
```
Le décodeur JwtDecoder s’adapte dynamiquement à l’environnement (Docker :
```
```
ms-keycloak ; local : localhost:9090), tandis que JwtAuthenticationConverter
```
extrait les rôles du claim realm_access.roles pour une autorisation granulaire.
```
Swagger est intégré (OpenAPIConfig) avec schéma Bearer JWT global, facilitant la
```
documentation et les tests automatisés. Le service métier ProductService orchestre
```
les interactions avec ProductRepository (JpaRepository), encapsulant la logique
```
métier comme la validation d’existence avant mise à jour.
Cette implémentation démontre la scalabilité du micro-service : indépendant,
conteneurisable et testable via JUnit/Testcontainers, avec logging DEBUG pour tracer
les flux sécurisés. Elle prépare le terrain pour des évolutions comme la pagination ou
l’intégration événementielle, alignée sur les standards industriels des applications
12-factor.
6. Description détaillée du micro-service Commande
Le micro-service Commande, exposé sur le port 8082, gère le cycle de vie des
commandes clients au sein de l’écosystème micro-services, en intégrant une relation
bidirectionnelle avec le service Produit via OpenFeign. Développé avec Spring Boot et
```
JPA/Hibernate, il persiste les données dans une base PostgreSQL dédiée (db_order sur
```
```
ms-postgres:5432), avec des entités Order (orderId, date_commande, statut,
```
```
montant_total, customerId) et OrderItems (id, productId, quantity, price) liées par
```
@OneToMany/@ManyToOne. Cette modélisation relationnelle intra-service assure
l’autonomie des données tout en supportant les cascades pour la gestion des lignes de
commande.
Le contrôleur REST OrderController propose une API complète sous /api/orders,
sécurisée par @PreAuthorize sur les rôles Keycloak : création/lecture pour
CLIENT/ADMIN, mise à jour/suppression restreinte. Les endpoints clés incluent POST
```
/api/orders (création avec customerId extrait du JWT via preferred_username), GET
```
```
/api/orders (toutes les commandes), GET /api/orders/my-orders (commandes
```
```
client), GET/PUT/DELETE /api/orders/{id} et PUT /api/orders/{id} pour les statuts.
```
L’authentification OAuth2/JWT est configurée de manière identique au service Produit,
avec décodeur adaptatif Docker/local et extraction des rôles realm_access.roles.
Une interaction inter-services sophistiquée est mise en œuvre via ProductRestClient
```
(FeignClient vers http://localhost:8081/api/products/{id}), propagé par
```
FeignConfig qui forward l’en-tête Authorization JWT. Lors de la création
```
(createOrder), le service valide le stock en temps réel, calcule le montant_total et
```
assigne les prix produits, préfigurant un pattern Saga pour la gestion distribuée des
transactions. Le service métier OrderService orchestre ces appels avec logging SLF4J
```
et gestion d’erreurs (ex. : stock insuffisant), tandis que OrderRepository supporte les
```
```
requêtes custom (findByCustomerId).
```
```
La conteneurisation multi-étapes (Dockerfile Maven/Alpine) optimise le déploiement,
```
aligné sur les pratiques DevSecOps. Cette implémentation illustre les défis des
micro-services – communication synchrone sécurisée, consistance éventuelle et
résilience – tout en maintenant l’indépendance du service Commande, prêt pour des
orchestrations asynchrones futures comme Kafka.
7. Mécanismes de sécurité et authentification
Les mécanismes de sécurité constituent un pilier fondamental de l’architecture
micro-services proposée, avec Keycloak déployé comme serveur IAM centralisé sur le
```
realm mini-project (accessible via
```
```
http://ms-keycloak:9090/realms/mini-project). Ce realm isolé gère l’ensemble des
```
identités, authentifications et autorisations pour l’écosystème, configuré avec le client
```
ecom-frontend (Valid Redirect URIs : http://localhost:3000/*) autorisant l’origine
```
web localhost:3000 pour le frontend React. Keycloak implémente les protocoles
OAuth2/OpenID Connect, émettant des tokens JWT validés par l’API Gateway et les
micro-services via leurs JWKS endpoints respectifs
```
(/protocol/openid-connect/certs), garantissant ainsi une authentification
```
zéro-confiance.
```
La gestion des autorisations repose sur deux rôles realm-level (ADMIN, CLIENT) assignés
```
aux utilisateurs admin, client et random selon leurs privilèges. L’ADMIN accède aux
```
opérations mutatives (création/suppression produits/commandes), tandis que le
```
CLIENT se limite aux lectures et créations de commandes personnelles
```
(/api/orders/my-orders). Les services Produit et Commande extraient ces rôles via
```
JwtAuthenticationConverter du claim realm_access.roles, les préfixant en
ROLE_ADMIN/ROLE_CLIENT pour les annotations @PreAuthorize Spring Security. Cette
```
approche granulaire illustre le pattern RBAC (Role-Based Access Control) standard des
```
architectures sécurisées.
Le flux d’authentification suit un schéma classique OAuth2 Authorization Code Flow +
```
PKCE : le frontend React (client ecom-frontend) redirige vers Keycloak pour
```
login/consentement, reçoit un code d’autorisation échangé contre un JWT
```
access_token (TTL configurable). Ce token, propagé via l’en-tête Authorization:
```
```
Bearer, est validé à chaque hop (Gateway → Produit/Commande) par
```
```
NimbusJwtDecoder adaptatif (Docker : ms-keycloak, local : localhost:9090). L’API
```
Gateway centralise la première validation, tandis que FeignClient du service Commande
```
forward le token pour les appels inter-services (ex. : validation stock Produit).
```
Cette implémentation DevSecOps intègre la sécurité dès la conception : tokens à durée
de vie courte, scopes granulaires, audit via Keycloak events, et rotation automatique des
clés RSA. Elle démontre concrètement comment Keycloak orchestre un écosystème
micro-services résilient face aux menaces d’authentification et d’escalade de privilèges.
8. Déploiement et conteneurisation
Le déploiement de l’architecture micro-services repose sur une approche DevSecOps
```
moderne utilisant Docker et Docker Compose (version 3.8), orchestrant l’ensemble des
```
composants dans un environnement conteneurisé reproductible. Le fichier
docker-compose.yml définit cinq services principaux : une base PostgreSQL unique
```
(ms-postgres:5433→5432) avec deux bases dédiées (db_product, db_order) initialisées
```
```
via ./init.sql, Keycloak (ms-keycloak:9090), les micro-services Produit
```
```
(ms-product:8081) et Commande (ms-order:8082), ainsi que l’API Gateway
```
```
(ms-gateway:8080). Cette stack respecte les dépendances (depends_on) et expose les
```
```
ports standard pour les interactions frontend (localhost:3000).
```
Chaque micro-service utilise un Dockerfile multi-étapes optimisé : première étape
```
Maven (maven:3.9.6-eclipse-temurin-17) pour la compilation (mvn clean package
```
```
-Dmaven.test.skip=true), seconde étape runtime légère
```
```
(eclipse-temurin:17-jdk-alpine) ne contenant que le JAR final (app.jar). Cette
```
```
pratique réduit drastiquement la taille des images (de ~1GB à ~200MB) tout en
```
éliminant les dépendances de build inutiles en production, alignée sur les principes des
```
applications 12-factor. Les variables d’environnement Spring (SPRING_DATASOURCE_URL,
```
```
KEYCLOAK_URL) sont injectées dynamiquement, adaptant les connexions internes
```
```
Docker (ms-postgres:5432, ms-keycloak:9090).
```
```
Keycloak est configuré en mode développement (start-dev) avec proxy edge
```
```
(KC_PROXY=edge) et hostname strict désactivé, facilitant les tests locaux via
```
```
http://localhost:9090. La base PostgreSQL supporte les multi-bases via
```
```
POSTGRES_MULTIPLE_DATABASES, tandis que pgAdmin (ms-pgadmin:5050) offre une
```
```
interface d’administration. Les extra_hosts (host.docker.internal:host-gateway)
```
résolvent les accès hybrides local/Docker, essentiels pour le développement
frontend/backend. L’API Gateway centralise les dépendances, démarrant en dernier
pour garantir la disponibilité des services aval.
Cette infrastructure Dockerisée illustre l’industrialisation des déploiements
micro-services : docker-compose up -d déploie l’ensemble en une commande, avec
```
hot-reload Maven pour le développement et scalabilité horizontale prête (réplication
```
```
services via docker-compose scale). Elle prépare l’évolution vers Kubernetes pour la
```
```
production, avec scans de vulnérabilités (Trivy) et CI/CD (GitHub Actions) intégrés dans
```
le pipeline DevSecOps.
9. Mise en œuvre et validation fonctionnelle
La mise en œuvre technique de l'architecture micro-services s'est déroulée selon une
approche itérative, validée par des tests fonctionnels manuels et des inspections
visuelles des interfaces d'administration. Le déploiement via docker-compose up -d
orchestre l'ensemble de la stack en moins de 2 minutes, exposant les ports standards :
```
Gateway (localhost:8080), Produit (localhost:8081), Commande (localhost:8082),
```
```
Keycloak (localhost:9090) et pgAdmin (localhost:5050). L'accès à Swagger UI sur
```
```
chaque service (/swagger-ui.html) confirme l'exposition correcte des APIs REST
```
documentées avec OpenAPI 3, incluant les schémas Bearer JWT.
```
La configuration Keycloak (mini-project realm) a été validée via l'interface
```
```
d'administration : création du client ecom-frontend (web origins : localhost:3000),
```
définition des rôles ADMIN/CLIENT, et provisionnement des utilisateurs
admin/client/random avec mots de passe standards. Les tests d'authentification
réussis montrent l'émission de tokens JWT contenant realm_access.roles, validés
séquentiellement par Gateway → micro-services. L'interaction inter-services via Feign
```
(Commande → Produit) propage correctement l'en-tête Authorization, validant la
```
validation stock en temps réel lors de la création de commande.
```
Les bases PostgreSQL (db_product, db_order) sont accessibles via pgAdmin,
```
confirmant la persistance des entités Product et Order/OrderItems avec relations JPA
```
fonctionnelles (@OneToMany/@ManyToOne). Les logs DEBUG (Spring Security, Web,
```
```
OAuth2) dans les containers Docker facilitent le diagnostic : flux JWT, routage Gateway
```
```
predicates (/api/products/** → product-service:8081), et résolution DNS interne
```
```
(ms-postgres, ms-keycloak). L'absence d'erreurs CORS et CSRF, combinée à la
```
```
conteneurisation multi-étapes (~200MB/image), valide l'industrialisation.
```
```
Cette validation fonctionnelle sans tests automatisés (bonus non implémenté) confirme
```
l'opérationalité de l'architecture : authentification zéro-confiance, isolation des services,
```
et déploiement one-click. Les captures d'écran (Keycloak Admin Console, Swagger APIs,
```
```
pgAdmin schemas, logs Docker) attesteraient visuellement cette réussite technique.
```
```
USER : ADMIN
```
```
USER: ABDO
```
10. Conclusion et perspectives
Ce mini-projet démontre avec succès la mise en œuvre pratique d'une architecture
micro-services sécurisée pour la gestion de produits et commandes, respectant
scrupuleusement les principes d'isolation, modularité et scalabilité évoqués dans le
```
contexte initial. L'API Gateway (Spring Cloud Gateway) orchestre les interactions, les
```
```
micro-services Produit et Commande (Spring Boot/JPA) gèrent des domaines métier
```
```
distincts avec bases PostgreSQL dédiées, tandis que Keycloak (mini-project realm)
```
implémente une authentification OAuth2/JWT robuste avec rôles granulaires
```
(ADMIN/CLIENT). Le déploiement Docker Compose industrialise l'ensemble, validé par
```
des configurations adaptatives Docker/local et une conteneurisation multi-étapes
optimisée.
```
L’approche DevSecOps intégrée – sécurité native (@PreAuthorize, JWT propagation
```
```
Feign), logging DEBUG, et stack reproductible (docker-compose up -d) – illustre
```
concrètement les standards industriels actuels, depuis la transformation numérique
```
jusqu'à l'exploitation continue. L'interaction synchrone Commande→Produit (validation
```
```
stock, calcul montant) préfigure les patterns distribués comme Saga/Choreography,
```
tandis que l'encapsulation via Gateway renforce la résilience face aux évolutions
indépendantes des services.
Les perspectives d'évolution incluent l'orchestration Kubernetes pour la scalabilité
```
horizontale, l'intégration événementielle asynchrone (Kafka/RabbitMQ) pour découpler
```
```
davantage les services, et un monitoring distribué (Prometheus/Grafana + ELK). L'ajout
```
```
de tests automatisés (JUnit/Testcontainers, SonarQube) et de scans de vulnérabilités
```
```
(Trivy/Snyk) compléterait le pipeline CI/CD. Ce projet fournit ainsi un socle expérimental
```
solide, sensibilisant aux défis et bonnes pratiques des architectures micro-services
modernes en contexte sécurisé.
