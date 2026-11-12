package com.lamaisonorientale.commande.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record PublicCommandeDetailDto(
        Long id,
        String reference,
        String mode,
        String statut,
        String nomClient,
        BigDecimal total,
        String adresseLivraison,
        String commentaire,
        String modePaiement,
        Instant createdAt,
        List<LigneDto> lignes,
        boolean cancellable,
        String gestionToken) {

    public record LigneDto(String nom, BigDecimal prixUnitaire, Integer quantite, BigDecimal sousTotal) {}
}
