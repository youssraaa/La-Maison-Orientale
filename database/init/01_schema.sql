-- La Maison Orientale — schema PostgreSQL v1
-- Executer apres demarrage du conteneur Postgres (voir README)

CREATE TABLE IF NOT EXISTS utilisateur (
    id                  BIGSERIAL PRIMARY KEY,
    email               VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hash   VARCHAR(255) NOT NULL,
    nom                 VARCHAR(100),
    role                VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorie (
    id                  BIGSERIAL PRIMARY KEY,
    nom                 VARCHAR(100) NOT NULL,
    ordre_affichage     INT NOT NULL DEFAULT 0,
    active              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS plat (
    id                  BIGSERIAL PRIMARY KEY,
    categorie_id        BIGINT NOT NULL REFERENCES categorie(id),
    nom                 VARCHAR(150) NOT NULL,
    description         TEXT,
    prix                DECIMAL(10, 2) NOT NULL CHECK (prix >= 0),
    disponible          BOOLEAN NOT NULL DEFAULT TRUE,
    image_url           VARCHAR(500),
    ordre_affichage     INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS horaire_ouverture (
    id                  BIGSERIAL PRIMARY KEY,
    jour_semaine        SMALLINT NOT NULL CHECK (jour_semaine BETWEEN 1 AND 7),
    heure_ouverture     TIME NOT NULL,
    heure_fermeture     TIME NOT NULL,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (heure_ouverture < heure_fermeture)
);

CREATE TABLE IF NOT EXISTS fermeture_exceptionnelle (
    id                  BIGSERIAL PRIMARY KEY,
    date_fermeture      DATE NOT NULL UNIQUE,
    motif               VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS creneau_reservation (
    id                  BIGSERIAL PRIMARY KEY,
    date_creneau        DATE NOT NULL,
    heure_debut         TIME NOT NULL,
    capacite_max        INT NOT NULL CHECK (capacite_max > 0),
    places_reservees    INT NOT NULL DEFAULT 0 CHECK (places_reservees >= 0),
    UNIQUE (date_creneau, heure_debut)
);

CREATE TABLE IF NOT EXISTS reservation (
    id                  BIGSERIAL PRIMARY KEY,
    creneau_id          BIGINT REFERENCES creneau_reservation(id),
    date_reservation    DATE NOT NULL,
    heure_reservation   TIME NOT NULL,
    nb_personnes        INT NOT NULL CHECK (nb_personnes > 0),
    nom_client          VARCHAR(100) NOT NULL,
    email_client        VARCHAR(255),
    telephone_client    VARCHAR(30) NOT NULL,
    commentaire         TEXT,
    statut              VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (statut IN ('EN_ATTENTE', 'CONFIRMEE', 'REFUSEE', 'ANNULEE'))
);

CREATE TABLE IF NOT EXISTS demande_client (
    id                  BIGSERIAL PRIMARY KEY,
    type_demande        VARCHAR(30) NOT NULL,
    nom                 VARCHAR(100) NOT NULL,
    email               VARCHAR(255),
    telephone           VARCHAR(30),
    message             TEXT NOT NULL,
    statut              VARCHAR(20) NOT NULL DEFAULT 'NOUVELLE',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (statut IN ('NOUVELLE', 'TRAITEE'))
);

CREATE INDEX IF NOT EXISTS idx_plat_categorie ON plat(categorie_id, disponible);
CREATE INDEX IF NOT EXISTS idx_reservation_date_statut ON reservation(date_reservation, statut);
CREATE INDEX IF NOT EXISTS idx_creneau_date ON creneau_reservation(date_creneau, heure_debut);
