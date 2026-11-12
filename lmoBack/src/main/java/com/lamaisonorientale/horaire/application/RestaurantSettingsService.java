package com.lamaisonorientale.horaire.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalTime;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.horaire.domain.ParametreRestaurant;
import com.lamaisonorientale.horaire.dto.PublicOrderPolicyDto;
import com.lamaisonorientale.horaire.dto.PublicReservationPolicyDto;
import com.lamaisonorientale.horaire.dto.RestaurantSettingsDto;
import com.lamaisonorientale.horaire.dto.UpdateRestaurantSettingsRequest;
import com.lamaisonorientale.horaire.infrastructure.ParametreRestaurantRepository;

@Service
public class RestaurantSettingsService {

    private static final Map<String, String> DEFAULTS = Map.ofEntries(
            Map.entry("capacite_max_creneau", "50"),
            Map.entry("capacite_salle", "34"),
            Map.entry("capacite_terrasse", "16"),
            Map.entry("duree_creneau_minutes", "30"),
            Map.entry("duree_table_minutes", "90"),
            Map.entry("duree_table_client_minutes", "120"),
            Map.entry("horizon_reservation_jours", "60"),
            Map.entry("delai_modification_heures", "2"),
            Map.entry("seuil_annulation_en_ligne_personnes", "10"),
            Map.entry("heure_ouverture_defaut", "12:00"),
            Map.entry("heure_fermeture_defaut", "22:30"),
            Map.entry("email_notif_restaurant", ""),
            Map.entry("frais_livraison_eur", "2.50"),
            Map.entry("montant_minimum_livraison_eur", "25.00"));

    private final ParametreRestaurantRepository parametreRepository;

    public RestaurantSettingsService(ParametreRestaurantRepository parametreRepository) {
        this.parametreRepository = parametreRepository;
    }

    @Transactional(readOnly = true)
    public RestaurantSettingsDto getSettings() {
        ensureDefaults();
        return new RestaurantSettingsDto(
                getInt("capacite_max_creneau", 50),
                getInt("capacite_salle", 34),
                getInt("capacite_terrasse", 16),
                getInt("duree_creneau_minutes", 30),
                getInt("duree_table_minutes", 90),
                getInt("duree_table_client_minutes", 120),
                getInt("delai_modification_heures", 2),
                getInt("seuil_annulation_en_ligne_personnes", 10),
                getInt("horizon_reservation_jours", 60),
                getString("heure_ouverture_defaut", "12:00"),
                getString("heure_fermeture_defaut", "22:30"),
                getString("email_notif_restaurant", ""),
                getDecimal("frais_livraison_eur", new BigDecimal("2.50")),
                getDecimal("montant_minimum_livraison_eur", new BigDecimal("25.00")));
    }

    @Transactional(readOnly = true)
    public PublicReservationPolicyDto getPublicPolicy() {
        ensureDefaults();
        return new PublicReservationPolicyDto(
                getInt("seuil_annulation_en_ligne_personnes", 10),
                getInt("delai_modification_heures", 2),
                getInt("duree_table_minutes", 90),
                getInt("duree_table_client_minutes", 120),
                getInt("capacite_max_creneau", 50));
    }

    @Transactional(readOnly = true)
    public PublicOrderPolicyDto getPublicOrderPolicy() {
        ensureDefaults();
        return new PublicOrderPolicyDto(
                getDecimal("frais_livraison_eur", new BigDecimal("2.50")),
                getDecimal("montant_minimum_livraison_eur", new BigDecimal("25.00")));
    }

    @Transactional
    public RestaurantSettingsDto update(UpdateRestaurantSettingsRequest request) {
        ensureDefaults();
        if (request.capaciteMaxCreneau() != null) {
            upsert("capacite_max_creneau", String.valueOf(request.capaciteMaxCreneau()));
        }
        if (request.capaciteSalle() != null) {
            upsert("capacite_salle", String.valueOf(request.capaciteSalle()));
        }
        if (request.capaciteTerrasse() != null) {
            upsert("capacite_terrasse", String.valueOf(request.capaciteTerrasse()));
        }
        if (request.dureeCreneauMinutes() != null) {
            upsert("duree_creneau_minutes", String.valueOf(request.dureeCreneauMinutes()));
        }
        if (request.dureeTableMinutes() != null) {
            upsert("duree_table_minutes", String.valueOf(request.dureeTableMinutes()));
        }
        if (request.dureeTableClientMinutes() != null) {
            upsert("duree_table_client_minutes", String.valueOf(request.dureeTableClientMinutes()));
        }
        if (request.delaiModificationHeures() != null) {
            upsert("delai_modification_heures", String.valueOf(request.delaiModificationHeures()));
        }
        if (request.seuilAnnulationEnLignePersonnes() != null) {
            upsert("seuil_annulation_en_ligne_personnes", String.valueOf(request.seuilAnnulationEnLignePersonnes()));
        }
        if (request.horizonReservationJours() != null) {
            upsert("horizon_reservation_jours", String.valueOf(request.horizonReservationJours()));
        }
        if (request.heureOuvertureDefaut() != null) {
            upsert("heure_ouverture_defaut", request.heureOuvertureDefaut().trim());
        }
        if (request.heureFermetureDefaut() != null) {
            upsert("heure_fermeture_defaut", request.heureFermetureDefaut().trim());
        }
        if (request.emailNotifRestaurant() != null) {
            upsert("email_notif_restaurant", request.emailNotifRestaurant().trim());
        }
        if (request.fraisLivraison() != null) {
            upsert(
                    "frais_livraison_eur",
                    request.fraisLivraison().max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP).toPlainString());
        }
        if (request.montantMinimumLivraison() != null) {
            upsert(
                    "montant_minimum_livraison_eur",
                    request.montantMinimumLivraison()
                            .max(BigDecimal.ZERO)
                            .setScale(2, RoundingMode.HALF_UP)
                            .toPlainString());
        }

        return getSettings();
    }

    @Transactional(readOnly = true)
    public int getInt(String key, int fallback) {
        return parametreRepository
                .findById(key)
                .map(p -> {
                    try {
                        return Integer.parseInt(p.getValeur());
                    } catch (NumberFormatException ex) {
                        return fallback;
                    }
                })
                .orElse(fallback);
    }

    @Transactional(readOnly = true)
    public String getString(String key, String fallback) {
        return parametreRepository.findById(key).map(ParametreRestaurant::getValeur).orElse(fallback);
    }

    @Transactional(readOnly = true)
    public BigDecimal getDecimal(String key, BigDecimal fallback) {
        return parametreRepository
                .findById(key)
                .map(p -> {
                    try {
                        return new BigDecimal(p.getValeur().trim()).max(BigDecimal.ZERO);
                    } catch (NumberFormatException ex) {
                        return fallback;
                    }
                })
                .orElse(fallback);
    }

    @Transactional(readOnly = true)
    public LocalTime getDefaultOpenTime() {
        return LocalTime.parse(getString("heure_ouverture_defaut", "12:00"));
    }

    @Transactional(readOnly = true)
    public LocalTime getDefaultCloseTime() {
        return LocalTime.parse(getString("heure_fermeture_defaut", "22:30"));
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
