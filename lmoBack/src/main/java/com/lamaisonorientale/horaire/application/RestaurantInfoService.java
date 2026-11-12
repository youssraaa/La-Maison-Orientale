package com.lamaisonorientale.horaire.application;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.horaire.domain.ParametreRestaurant;
import com.lamaisonorientale.horaire.dto.PublicRestaurantInfoDto;
import com.lamaisonorientale.horaire.dto.RestaurantInfoDto;
import com.lamaisonorientale.horaire.dto.UpdateRestaurantInfoRequest;
import com.lamaisonorientale.horaire.infrastructure.ParametreRestaurantRepository;

@Service
public class RestaurantInfoService {

    private static final String SERVICES_SEPARATOR = "|";

    private static final Map<String, String> DEFAULTS = new LinkedHashMap<>();

    static {
        DEFAULTS.put("nom_restaurant", "La Maison Orientale");
        DEFAULTS.put("tagline", "Restaurant Snack BBQ & Shawarma au charbon");
        DEFAULTS.put("cuisine", "Cuisine syrienne");
        DEFAULTS.put("services", "Sur place|À emporter|Livraison");
        DEFAULTS.put("adresse_rue", "Rue Jules Destrée 219");
        DEFAULTS.put("adresse_ville", "7390 Quaregnon");
        DEFAULTS.put("telephone", "0498 67 22 62");
        DEFAULTS.put("email_contact", "contact@lamaisonorientale.be");
        DEFAULTS.put("instagram_url", "https://www.instagram.com/la_maisonorientale/");
        DEFAULTS.put("tiktok_url", "https://www.tiktok.com/@la_maisonorientale");
        DEFAULTS.put("google_rating_score", "4,6");
        DEFAULTS.put("google_rating_count", "50 avis");
        DEFAULTS.put(
                "google_reviews_url",
                "https://www.google.com/maps/place/maison+orientale/@50.4444201,3.8642042,17z");
    }

    private final ParametreRestaurantRepository parametreRepository;

    public RestaurantInfoService(ParametreRestaurantRepository parametreRepository) {
        this.parametreRepository = parametreRepository;
    }

    @Transactional(readOnly = true)
    public RestaurantInfoDto getInfo() {
        ensureDefaults();
        return toAdminDto();
    }

    @Transactional(readOnly = true)
    public PublicRestaurantInfoDto getPublicInfo() {
        ensureDefaults();
        RestaurantInfoDto info = toAdminDto();
        String fullAddress = info.adresseRue() + ", " + info.adresseVille();
        String phoneDigits = info.telephone().replaceAll("\\D", "");
        String phoneHref = phoneDigits.startsWith("0")
                ? "tel:+32" + phoneDigits.substring(1)
                : "tel:+" + phoneDigits;
        return new PublicRestaurantInfoDto(
                info.nom(),
                info.tagline(),
                info.cuisine(),
                info.services(),
                info.adresseRue(),
                info.adresseVille(),
                fullAddress,
                info.telephone(),
                phoneHref,
                info.emailContact(),
                "mailto:" + info.emailContact(),
                info.instagramUrl(),
                info.tiktokUrl(),
                info.googleRatingScore(),
                info.googleRatingCount(),
                info.googleReviewsUrl());
    }

    @Transactional
    public RestaurantInfoDto update(UpdateRestaurantInfoRequest request) {
        ensureDefaults();
        if (request.nom() != null) {
            upsert("nom_restaurant", request.nom().trim());
        }
        if (request.tagline() != null) {
            upsert("tagline", request.tagline().trim());
        }
        if (request.cuisine() != null) {
            upsert("cuisine", request.cuisine().trim());
        }
        if (request.services() != null) {
            String joined = request.services().stream()
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .collect(Collectors.joining(SERVICES_SEPARATOR));
            upsert("services", joined);
        }
        if (request.adresseRue() != null) {
            upsert("adresse_rue", request.adresseRue().trim());
        }
        if (request.adresseVille() != null) {
            upsert("adresse_ville", request.adresseVille().trim());
        }
        if (request.telephone() != null) {
            upsert("telephone", request.telephone().trim());
        }
        if (request.emailContact() != null) {
            upsert("email_contact", request.emailContact().trim());
        }
        if (request.instagramUrl() != null) {
            upsert("instagram_url", request.instagramUrl().trim());
        }
        if (request.tiktokUrl() != null) {
            upsert("tiktok_url", request.tiktokUrl().trim());
        }
        if (request.googleRatingScore() != null) {
            upsert("google_rating_score", request.googleRatingScore().trim());
        }
        if (request.googleRatingCount() != null) {
            upsert("google_rating_count", request.googleRatingCount().trim());
        }
        if (request.googleReviewsUrl() != null) {
            upsert("google_reviews_url", request.googleReviewsUrl().trim());
        }

        return toAdminDto();
    }

    private RestaurantInfoDto toAdminDto() {
        return new RestaurantInfoDto(
                getString("nom_restaurant"),
                getString("tagline"),
                getString("cuisine"),
                parseServices(getString("services")),
                getString("adresse_rue"),
                getString("adresse_ville"),
                getString("telephone"),
                getString("email_contact"),
                getString("instagram_url"),
                getString("tiktok_url"),
                getString("google_rating_score"),
                getString("google_rating_count"),
                getString("google_reviews_url"));
    }

    private List<String> parseServices(String raw) {
        if (!StringUtils.hasText(raw)) {
            return List.of();
        }
        return Arrays.stream(raw.split("\\|"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    private String getString(String key) {
        return parametreRepository
                .findById(key)
                .map(ParametreRestaurant::getValeur)
                .orElse(DEFAULTS.getOrDefault(key, ""));
    }

    private void ensureDefaults() {
        DEFAULTS.forEach((key, value) -> {
            if (!parametreRepository.existsById(key)) {
                upsert(key, value);
            }
        });
    }

    private void upsert(String key, String value) {
        ParametreRestaurant row = parametreRepository.findById(key).orElseGet(ParametreRestaurant::new);
        row.setCle(key);
        row.setValeur(value);
        row.setUpdatedAt(Instant.now());
        parametreRepository.save(row);
    }
}
