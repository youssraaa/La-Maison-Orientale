package com.lamaisonorientale.menu.dto;

import java.math.BigDecimal;

public record PlatDto(
        Long id,
        Long categorieId,
        String nom,
        String description,
        BigDecimal prix,
        Boolean disponibleEmporter,
        Boolean disponibleLivraison,
        String imageUrl,
        Integer ordreAffichage,
        String sousSection,
        Boolean featured) {}
