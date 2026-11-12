package com.lamaisonorientale.common.persistence;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Applique les patches SQL manquants sur une base déjà initialisée
 * (les scripts docker-entrypoint-initdb.d ne rejouent pas).
 */
@Component
@Profile("!test")
@Order(1)
public class SchemaPatchRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaPatchRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public SchemaPatchRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("ALTER TABLE categorie ADD COLUMN IF NOT EXISTS slug VARCHAR(100)");
        jdbcTemplate.execute("ALTER TABLE categorie ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)");
        jdbcTemplate.execute("ALTER TABLE categorie ADD COLUMN IF NOT EXISTS note VARCHAR(255)");
        jdbcTemplate.execute("ALTER TABLE plat ADD COLUMN IF NOT EXISTS sous_section VARCHAR(100)");
        jdbcTemplate.execute(
                "ALTER TABLE plat ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE");
        jdbcTemplate.execute(
                """
                CREATE TABLE IF NOT EXISTS galerie_photo (
                    id BIGSERIAL PRIMARY KEY,
                    image_url VARCHAR(500) NOT NULL,
                    alt VARCHAR(255),
                    ordre_affichage INT NOT NULL DEFAULT 0,
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    afficher_accueil BOOLEAN NOT NULL DEFAULT FALSE
                )
                """);
        jdbcTemplate.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS idx_categorie_slug ON categorie (slug)
                WHERE slug IS NOT NULL
                """);
        jdbcTemplate.execute(
                "CREATE INDEX IF NOT EXISTS idx_galerie_ordre ON galerie_photo (active, ordre_affichage)");
        jdbcTemplate.execute(
                """
                CREATE TABLE IF NOT EXISTS user_token (
                    id BIGSERIAL PRIMARY KEY,
                    utilisateur_id BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
                    token VARCHAR(64) NOT NULL UNIQUE,
                    type_token VARCHAR(30) NOT NULL,
                    expires_at TIMESTAMPTZ NOT NULL,
                    used_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """);
        jdbcTemplate.execute(
                """
                CREATE TABLE IF NOT EXISTS notification (
                    id BIGSERIAL PRIMARY KEY,
                    utilisateur_id BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
                    type_notif VARCHAR(40) NOT NULL,
                    titre VARCHAR(150) NOT NULL,
                    message TEXT NOT NULL,
                    lien VARCHAR(255),
                    lue BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """);
        jdbcTemplate.execute(
                "CREATE INDEX IF NOT EXISTS idx_notification_user ON notification (utilisateur_id, lue, created_at DESC)");
        jdbcTemplate.execute(
                """
                CREATE TABLE IF NOT EXISTS parametre_restaurant (
                    cle VARCHAR(80) PRIMARY KEY,
                    valeur VARCHAR(500) NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """);
        jdbcTemplate.execute(
                """
                INSERT INTO parametre_restaurant (cle, valeur) VALUES
                    ('capacite_max_creneau', '50'),
                    ('capacite_salle', '34'),
                    ('capacite_terrasse', '16'),
                    ('duree_creneau_minutes', '30'),
                    ('duree_table_minutes', '90'),
                    ('horizon_reservation_jours', '60'),
                    ('delai_modification_heures', '2'),
                    ('seuil_annulation_en_ligne_personnes', '10'),
                    ('heure_ouverture_defaut', '12:00'),
                    ('heure_fermeture_defaut', '22:30'),
                    ('email_notif_restaurant', ''),
                    ('nom_restaurant', 'La Maison Orientale'),
                    ('tagline', 'Restaurant Snack BBQ & Shawarma au charbon'),
                    ('cuisine', 'Cuisine syrienne'),
                    ('services', 'Sur place|À emporter|Livraison'),
                    ('adresse_rue', 'Rue Jules Destrée 219'),
                    ('adresse_ville', '7390 Quaregnon'),
                    ('telephone', '0498 67 22 62'),
                    ('email_contact', 'contact@lamaisonorientale.be'),
                    ('instagram_url', 'https://www.instagram.com/la_maisonorientale/'),
                    ('tiktok_url', 'https://www.tiktok.com/@la_maisonorientale'),
                    ('google_rating_score', '4,6'),
                    ('google_rating_count', '50 avis'),
                    ('google_reviews_url', 'https://www.google.com/maps/place/maison+orientale/@50.4444201,3.8642042,17z')
                ON CONFLICT (cle) DO NOTHING
                """);
        jdbcTemplate.execute("ALTER TABLE demande_client ADD COLUMN IF NOT EXISTS reponse_interne TEXT");
        jdbcTemplate.execute("ALTER TABLE demande_client ADD COLUMN IF NOT EXISTS reponse_client TEXT");
        jdbcTemplate.execute("ALTER TABLE demande_client ADD COLUMN IF NOT EXISTS reponse_at TIMESTAMPTZ");
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS telephone VARCHAR(30)");
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS prenom VARCHAR(100)");
        jdbcTemplate.execute("ALTER TABLE reservation ADD COLUMN IF NOT EXISTS gestion_token VARCHAR(64)");
        jdbcTemplate.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_gestion_token ON reservation (gestion_token) WHERE gestion_token IS NOT NULL");
        jdbcTemplate.execute(
                "ALTER TABLE reservation ADD COLUMN IF NOT EXISTS utilisateur_id BIGINT REFERENCES utilisateur(id) ON DELETE SET NULL");
        jdbcTemplate.execute("UPDATE reservation SET statut = 'CONFIRMEE' WHERE statut = 'EN_ATTENTE'");
        jdbcTemplate.execute("ALTER TABLE reservation DROP CONSTRAINT IF EXISTS reservation_statut_check");
        jdbcTemplate.execute(
                "ALTER TABLE reservation ADD CONSTRAINT reservation_statut_check "
                        + "CHECK (statut IN ('CONFIRMEE', 'REFUSEE', 'ANNULEE', 'ARRIVEE', 'NO_SHOW'))");
        jdbcTemplate.execute(
                """
                CREATE TABLE IF NOT EXISTS commande (
                    id BIGSERIAL PRIMARY KEY,
                    reference VARCHAR(20) NOT NULL UNIQUE,
                    mode_commande VARCHAR(20) NOT NULL,
                    statut VARCHAR(20) NOT NULL DEFAULT 'CONFIRMEE',
                    nom_client VARCHAR(100) NOT NULL,
                    email_client VARCHAR(255),
                    telephone_client VARCHAR(30) NOT NULL,
                    adresse_livraison TEXT,
                    commentaire TEXT,
                    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
                    utilisateur_id BIGINT REFERENCES utilisateur(id) ON DELETE SET NULL,
                    gestion_token VARCHAR(64) NOT NULL UNIQUE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """);
        jdbcTemplate.execute("UPDATE commande SET statut = 'REMIS' WHERE statut = 'LIVREE' AND mode_commande = 'EMPORTER'");
        jdbcTemplate.execute("ALTER TABLE commande DROP CONSTRAINT IF EXISTS commande_statut_check");
        jdbcTemplate.execute(
                "ALTER TABLE commande ADD CONSTRAINT commande_statut_check "
                        + "CHECK (statut IN ('EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 'REMIS', 'LIVREE', 'ANNULEE'))");
        jdbcTemplate.execute(
                """
                CREATE TABLE IF NOT EXISTS ligne_commande (
                    id BIGSERIAL PRIMARY KEY,
                    commande_id BIGINT NOT NULL REFERENCES commande(id) ON DELETE CASCADE,
                    plat_id BIGINT REFERENCES plat(id) ON DELETE SET NULL,
                    nom_plat VARCHAR(150) NOT NULL,
                    prix_unitaire DECIMAL(10, 2) NOT NULL CHECK (prix_unitaire >= 0),
                    quantite INT NOT NULL CHECK (quantite > 0)
                )
                """);
        jdbcTemplate.execute(
                "CREATE INDEX IF NOT EXISTS idx_commande_created ON commande (created_at DESC)");
        jdbcTemplate.execute(
                "CREATE INDEX IF NOT EXISTS idx_commande_user ON commande (utilisateur_id, created_at DESC)");
        jdbcTemplate.execute("UPDATE parametre_restaurant SET valeur = '50' WHERE cle = 'capacite_max_creneau'");
        jdbcTemplate.execute("UPDATE parametre_restaurant SET valeur = '2' WHERE cle = 'delai_modification_heures'");
        jdbcTemplate.execute(
                """
                INSERT INTO parametre_restaurant (cle, valeur) VALUES
                    ('capacite_salle', '34'),
                    ('capacite_terrasse', '16'),
                    ('seuil_annulation_en_ligne_personnes', '10'),
                    ('duree_table_minutes', '90'),
                    ('duree_table_client_minutes', '120')
                ON CONFLICT (cle) DO NOTHING
                """);
        jdbcTemplate.execute("UPDATE parametre_restaurant SET valeur = '90' WHERE cle = 'duree_table_minutes'");
        jdbcTemplate.execute(
                "UPDATE parametre_restaurant SET valeur = '10' WHERE cle = 'seuil_annulation_libre_personnes'");
        jdbcTemplate.execute("ALTER TABLE commande ADD COLUMN IF NOT EXISTS mode_paiement VARCHAR(30)");
        jdbcTemplate.execute(
                "UPDATE commande SET mode_paiement = 'CARTE_SUR_PLACE' WHERE mode_paiement IS NULL");
        jdbcTemplate.execute(
                "ALTER TABLE commande ALTER COLUMN mode_paiement SET DEFAULT 'CARTE_SUR_PLACE'");
        jdbcTemplate.execute(
                "ALTER TABLE commande ALTER COLUMN mode_paiement SET NOT NULL");
        jdbcTemplate.execute(
                "ALTER TABLE plat ADD COLUMN IF NOT EXISTS disponible_emporter BOOLEAN NOT NULL DEFAULT TRUE");
        jdbcTemplate.execute(
                "ALTER TABLE plat ADD COLUMN IF NOT EXISTS disponible_livraison BOOLEAN NOT NULL DEFAULT TRUE");
        jdbcTemplate.execute(
                """
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plat' AND column_name='disponible') THEN
                        UPDATE plat SET disponible_emporter = disponible, disponible_livraison = disponible;
                        ALTER TABLE plat DROP COLUMN disponible;
                    END IF;
                END $$
                """);
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS pays VARCHAR(100)");
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS adresse VARCHAR(255)");
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS ville VARCHAR(100)");
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS code_postal VARCHAR(20)");
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS adresse_livraison VARCHAR(255)");
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS code_postal_livraison VARCHAR(20)");
        jdbcTemplate.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS ville_livraison VARCHAR(100)");
        log.info("Schema patch menu/galerie + admin + client appliqué.");
    }
}
