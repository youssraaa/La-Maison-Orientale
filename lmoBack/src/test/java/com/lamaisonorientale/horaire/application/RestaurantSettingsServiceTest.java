package com.lamaisonorientale.horaire.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

import com.lamaisonorientale.horaire.domain.ParametreRestaurant;
import com.lamaisonorientale.horaire.dto.PublicOrderPolicyDto;
import com.lamaisonorientale.horaire.dto.PublicReservationPolicyDto;
import com.lamaisonorientale.horaire.dto.RestaurantSettingsDto;
import com.lamaisonorientale.horaire.infrastructure.ParametreRestaurantRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RestaurantSettingsServiceTest {

    @Mock
    private ParametreRestaurantRepository parametreRepository;

    @InjectMocks
    private RestaurantSettingsService restaurantSettingsService;

    @Test
    void getSettings_ShouldReturnSettingsFromParameters() {
        when(parametreRepository.existsById(anyString())).thenReturn(true);
        stubInt("capacite_max_creneau", "50");
        stubInt("capacite_salle", "34");
        stubInt("capacite_terrasse", "16");
        stubInt("duree_creneau_minutes", "30");
        stubInt("duree_table_minutes", "90");
        stubInt("duree_table_client_minutes", "120");
        stubInt("delai_modification_heures", "2");
        stubInt("seuil_annulation_en_ligne_personnes", "10");
        stubInt("horizon_reservation_jours", "60");
        stubString("heure_ouverture_defaut", "12:00");
        stubString("heure_fermeture_defaut", "22:30");
        stubString("email_notif_restaurant", "");
        stubString("frais_livraison_eur", "2.50");
        stubString("montant_minimum_livraison_eur", "25.00");

        RestaurantSettingsDto settings = restaurantSettingsService.getSettings();

        assertThat(settings.capaciteMaxCreneau()).isEqualTo(50);
        assertThat(settings.heureOuvertureDefaut()).isEqualTo("12:00");
        assertThat(settings.fraisLivraison()).isEqualByComparingTo(new BigDecimal("2.50"));
    }

    @Test
    void getPublicPolicy_ShouldReturnReservationPolicy() {
        when(parametreRepository.existsById(anyString())).thenReturn(true);
        stubInt("capacite_max_creneau", "50");
        stubInt("duree_creneau_minutes", "30");
        stubInt("duree_table_minutes", "90");
        stubInt("duree_table_client_minutes", "120");
        stubInt("delai_modification_heures", "2");
        stubInt("seuil_annulation_en_ligne_personnes", "10");
        stubInt("horizon_reservation_jours", "60");
        stubString("heure_ouverture_defaut", "12:00");
        stubString("heure_fermeture_defaut", "22:30");
        stubString("email_notif_restaurant", "");
        stubString("frais_livraison_eur", "2.50");
        stubString("montant_minimum_livraison_eur", "25.00");

        PublicReservationPolicyDto policy = restaurantSettingsService.getPublicPolicy();

        assertThat(policy.maxOnlineCovers()).isEqualTo(10);
        assertThat(policy.maxCoversPerSlot()).isEqualTo(50);
        assertThat(policy.modificationDeadlineHours()).isEqualTo(2);
    }

    @Test
    void getPublicOrderPolicy_ShouldReturnOrderPolicy() {
        when(parametreRepository.existsById(anyString())).thenReturn(true);
        stubInt("capacite_max_creneau", "50");
        stubInt("capacite_salle", "34");
        stubInt("capacite_terrasse", "16");
        stubInt("duree_creneau_minutes", "30");
        stubInt("duree_table_minutes", "90");
        stubInt("duree_table_client_minutes", "120");
        stubInt("delai_modification_heures", "2");
        stubInt("seuil_annulation_en_ligne_personnes", "10");
        stubInt("horizon_reservation_jours", "60");
        stubString("heure_ouverture_defaut", "12:00");
        stubString("heure_fermeture_defaut", "22:30");
        stubString("email_notif_restaurant", "");
        stubString("frais_livraison_eur", "3.00");
        stubString("montant_minimum_livraison_eur", "30.00");

        PublicOrderPolicyDto policy = restaurantSettingsService.getPublicOrderPolicy();

        assertThat(policy.fraisLivraison()).isEqualByComparingTo(new BigDecimal("3.00"));
        assertThat(policy.montantMinimumLivraison()).isEqualByComparingTo(new BigDecimal("30.00"));
    }

    private void stubInt(String key, String value) {
        stubString(key, value);
    }

    private void stubString(String key, String value) {
        when(parametreRepository.findById(key)).thenReturn(Optional.of(param(key, value)));
    }

    private static ParametreRestaurant param(String key, String value) {
        ParametreRestaurant row = new ParametreRestaurant();
        row.setCle(key);
        row.setValeur(value);
        return row;
    }
}
