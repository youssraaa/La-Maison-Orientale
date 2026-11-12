package com.lamaisonorientale.horaire.dto;

import java.util.List;

public record UpdateRestaurantInfoRequest(
        String nom,
        String tagline,
        String cuisine,
        List<String> services,
        String adresseRue,
        String adresseVille,
        String telephone,
        String emailContact,
        String instagramUrl,
        String tiktokUrl,
        String googleRatingScore,
        String googleRatingCount,
        String googleReviewsUrl) {}
