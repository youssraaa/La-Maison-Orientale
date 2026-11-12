package com.lamaisonorientale.commande.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminCommandeDto(
        Long id,
        String reference,
        String mode,
        String statut,
        String nomClient,
        String emailClient,
        String telephoneClient,
        String adresseLivraison,
        String commentaire,
        String modePaiement,
        BigDecimal total,
        Instant createdAt,
        List<LigneDto> lignes) {

    public record LigneDto(String nom, BigDecimal prixUnitaire, Integer quantite) {}
}
