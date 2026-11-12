-- Carte & galerie — colonnes + table photos (bases déjà initialisées)

ALTER TABLE categorie
    ADD COLUMN IF NOT EXISTS slug VARCHAR(100),
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS note VARCHAR(255);

ALTER TABLE plat
    ADD COLUMN IF NOT EXISTS sous_section VARCHAR(100),
    ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categorie_slug ON categorie (slug)
    WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS galerie_photo (
    id                  BIGSERIAL PRIMARY KEY,
    image_url           VARCHAR(500) NOT NULL,
    alt                 VARCHAR(255),
    ordre_affichage     INT NOT NULL DEFAULT 0,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    afficher_accueil    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_galerie_ordre ON galerie_photo (active, ordre_affichage);
