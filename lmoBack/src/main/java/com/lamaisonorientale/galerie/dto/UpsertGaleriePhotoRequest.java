package com.lamaisonorientale.galerie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertGaleriePhotoRequest(
        @NotBlank @Size(max = 500) String imageUrl,
        @Size(max = 255) String alt,
        Integer ordreAffichage,
        Boolean active,
        Boolean afficherAccueil) {}
