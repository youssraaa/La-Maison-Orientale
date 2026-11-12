package com.lamaisonorientale.menu.dto;

public record CategorieDto(
        Long id,
        String nom,
        String slug,
        String imageUrl,
        String note,
        Integer ordreAffichage,
        Boolean active) {}
