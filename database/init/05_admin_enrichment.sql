-- Enrichissement espace admin : paramètres restaurant

CREATE TABLE IF NOT EXISTS parametre_restaurant (
    cle                 VARCHAR(80) PRIMARY KEY,
    valeur              VARCHAR(500) NOT NULL,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO parametre_restaurant (cle, valeur) VALUES
    ('capacite_max_creneau', '50'),
    ('capacite_salle', '34'),
    ('capacite_terrasse', '16'),
    ('duree_creneau_minutes', '30'),
    ('horizon_reservation_jours', '60'),
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
    ('tiktok_url', 'https://www.tiktok.com/@la_maisonorientale')
ON CONFLICT (cle) DO NOTHING;
