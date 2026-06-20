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

## E-mail (formulaire contact — même approche que GLOP)

Les secrets SMTP sont **uniquement** dans `.env` (jamais dans le code Java).

1. Créer un compte [Brevo](https://www.brevo.com) (gratuit) → **SMTP & API** → copier login + clé SMTP.
2. Renseigner dans `.env` à la racine : `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_RESTAURANT_TO`.
3. **Yopmail (test)** : `MAIL_RESTAURANT_TO=lamaisonorientale@yopmail.com` → consulter sur [yopmail.com](https://yopmail.com).
4. `docker compose up -d --build backend`

| Variable | Rôle |
|----------|------|
| `MAIL_HOST` | `smtp-relay.brevo.com` (défaut) |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Identifiants SMTP Brevo |
| `MAIL_FROM` | Expéditeur vérifié dans Brevo |
| `MAIL_RESTAURANT_TO` | Destinataire des demandes contact |

**Tests Maven** : profil `test` → `EmailServiceTestImpl` (aucun envoi réel).

## Configuration BDD

Fichier `src/main/resources/application.properties` :

- Host : `localhost`
- Port : `5433` (Docker)
- Base : `la_maison_orientale`
- User / password : `postgres` / `postgres123`

## IntelliJ / Eclipse

Ouvrir le dossier `lmoBack` comme projet Maven, lancer `LmoBackApplication.java`.
