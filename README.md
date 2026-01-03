
```markdown
# Application Micro-services Sécurisée  
## Gestion des Produits et Commandes  

Ce projet présente le développement d'une application web moderne basée sur une architecture micro-services sécurisée, utilisant **Spring Boot**, **React** et **Keycloak**. L'application permet de gérer des produits et des commandes dans un contexte d'entreprise, avec une forte attention portée à la sécurité, la modularité et la scalabilité.

---

## 📌 Contexte du projet  
Dans un environnement de transformation numérique, ce projet illustre comment concevoir une application distribuée en micro-services, en remplaçant les architectures monolithiques traditionnelles. L'objectif est de démontrer les principes d'isolation, de sécurité et de déploiement continu dans un écosystème micro-services.

---

## 🏗 Architecture générale  

- **Frontend** : React (interface utilisateur)  
- **API Gateway** : Spring Cloud Gateway (point d'entrée unique)  
- **Micro-services** :  
  - `Produit` (port 8081) – gestion des produits  
  - `Commande` (port 8082) – gestion des commandes  
- **Authentification** : Keycloak (IAM centralisé)  
- **Bases de données** : PostgreSQL (une base par service)  

Tous les composants sont conteneurisés avec Docker et orchestrés via Docker Compose.

---

## 🛠 Technologies utilisées  

| Composant       | Technologies                                  |
|-----------------|-----------------------------------------------|
| Frontend        | React, Axios, React Router, TypeScript        |
| Backend         | Spring Boot, Spring Cloud Gateway, JPA/Hibernate |
| Base de données | PostgreSQL                                    |
| Sécurité        | Keycloak, OAuth2, OpenID Connect, JWT         |
| Conteneurisation| Docker, Docker Compose                        |
| Outils          | Maven, pgAdmin, Swagger/OpenAPI               |

---

## 🔐 Mécanismes de sécurité  

- Authentification centralisée avec **Keycloak** (realm `mini-project`).  
- Rôles utilisateurs : `ADMIN` (accès complet) et `CLIENT` (lecture + commandes personnelles).  
- Tokens JWT validés à chaque appel entre services.  
- Sécurité des endpoints avec `@PreAuthorize` et extraction des rôles du token.  
- Configuration CORS pour le frontend React.  

---

## 🐳 Déploiement et conteneurisation  

Le projet utilise **Docker Compose** (version 3.8) pour orchestrer les services :

```yaml
services:
  ms-postgres  # Base de données PostgreSQL
  ms-keycloak  # Serveur d'authentification
  ms-product   # Micro-service Produit
  ms-order     # Micro-service Commande
  ms-gateway   # API Gateway
```

Chaque micro-service est construit via un **Dockerfile multi-étapes** (Maven + Alpine) pour une image légère et sécurisée.

Pour lancer l'application :

```bash
docker-compose up -d
```

---

## ✅ Validation fonctionnelle  

- Déploiement complet en moins de 2 minutes.  
- Interfaces Swagger accessibles sur chaque service.  
- Authentification et autorisation testées avec les rôles ADMIN et CLIENT.  
- Interaction inter-services (Commande → Produit) avec propagation du token JWT.  
- Persistance des données vérifiée via pgAdmin.  

---

## 📈 Perspectives d'évolution  

- Orchestration avec **Kubernetes** pour la production.  
- Intégration de messagerie asynchrone (**Kafka/RabbitMQ**).  
- Monitoring avec **Prometheus/Grafana** et **ELK**.  
- Ajout de tests automatisés (**JUnit/Testcontainers**).  
- Intégration continue avec **GitHub Actions** et scans de vulnérabilités (**Trivy/Snyk**).  

---

## 👥 Auteurs  

- **Étudiant** : Abdelkebir Bouchti  
- **Encadrant** : Abdelmajid BOUSSELHAM  
- **Année académique** : 2025–2026  

---

## 📄 Licence  

Ce projet est à but académique et éducatif.  

---

*Documentation technique complète disponible dans le rapport associé.*
```

---

Ce fichier README résume l'essentiel du projet : objectifs, architecture, technologies, sécurité, déploiement et perspectives. Vous pouvez l’utiliser comme point d’entrée pour toute personne souhaitant comprendre ou contribuer au projet.
