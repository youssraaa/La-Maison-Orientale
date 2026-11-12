package com.lamaisonorientale.horaire.dto;

import java.util.List;

public record PublicRestaurantInfoDto(
        String name,
        String tagline,
        String cuisine,
        List<String> services,
        String addressStreet,
        String addressCity,
        String addressFull,
        String phoneDisplay,
        String phoneHref,
        String emailDisplay,
        String emailHref,
        String instagramUrl,
        String tiktokUrl,
        String googleRatingScore,
        String googleRatingCount,
        String googleReviewsUrl) {}
