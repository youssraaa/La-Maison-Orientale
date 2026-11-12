-- Suivi de présence par l'espace agent
-- Les deux statuts existent déjà dans StatutReservation côté backend.
UPDATE reservation SET statut = 'CONFIRMEE' WHERE statut = 'EN_ATTENTE';
ALTER TABLE reservation DROP CONSTRAINT IF EXISTS reservation_statut_check;
ALTER TABLE reservation ADD CONSTRAINT reservation_statut_check
    CHECK (statut IN ('CONFIRMEE', 'REFUSEE', 'ANNULEE', 'ARRIVEE', 'NO_SHOW'));