package com.lamaisonorientale.menu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertCategorieRequest(
        @NotBlank @Size(max = 100) String nom,
        @Size(max = 100) String slug,
        @Size(max = 500) String imageUrl,
        @Size(max = 255) String note,
        Integer ordreAffichage,
        Boolean active) {}
