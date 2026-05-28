# lmoBack — Backend Spring Boot

## Prerequis

- Java 21
- Docker avec PostgreSQL demarre (`docker compose up -d` a la racine du projet)

## Lancer l'API

```powershell
cd lmoBack
.\mvnw.cmd spring-boot:run
```

## Tester

| URL | Description |
|-----|-------------|
| http://localhost:8080/api/health | API en ligne |
| http://localhost:8080/api/health/db | Connexion PostgreSQL (localhost:5433) |

Reponse attendue pour `/api/health/db` : `"database": "connected"`, `"tablesCount": 8`.

## Configuration BDD

Fichier `src/main/resources/application.properties` :

- Host : `localhost`
- Port : `5433` (Docker)
- Base : `la_maison_orientale`
- User / password : `postgres` / `postgres123`

## IntelliJ / Eclipse

Ouvrir le dossier `lmoBack` comme projet Maven, lancer `LmoBackApplication.java`.
