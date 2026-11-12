package com.lamaisonorientale.menu.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpsertPlatRequest(
        @NotNull Long categorieId,
        @NotBlank @Size(max = 150) String nom,
        String description,
        @NotNull @DecimalMin("0.0") BigDecimal prix,
        Boolean disponibleEmporter,
        Boolean disponibleLivraison,
        @Size(max = 500) String imageUrl,
        Integer ordreAffichage,
        @Size(max = 100) String sousSection,
        Boolean featured) {}
