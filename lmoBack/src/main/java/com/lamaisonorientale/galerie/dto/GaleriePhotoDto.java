package com.lamaisonorientale.galerie.dto;

public record GaleriePhotoDto(
        Long id,
        String imageUrl,
        String alt,
        Integer ordreAffichage,
        Boolean active,
        Boolean afficherAccueil) {}
