package com.lamaisonorientale.commande.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CommandeResponseDto(
        Long id,
        String reference,
        String message,
        String mode,
        String statut,
        BigDecimal total,
        String manageToken,
        String manageUrl,
        Instant createdAt,
        List<LigneDto> lignes) {

    public record LigneDto(String nom, BigDecimal prixUnitaire, Integer quantite, BigDecimal sousTotal) {}
}
