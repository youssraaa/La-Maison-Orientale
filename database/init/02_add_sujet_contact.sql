-- Ajoute le sujet pour les demandes de contact (bases déjà initialisées)
ALTER TABLE demande_client
    ADD COLUMN IF NOT EXISTS sujet VARCHAR(120);
