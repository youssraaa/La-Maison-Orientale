package com.lamaisonorientale.horaire.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lamaisonorientale.horaire.domain.ParametreRestaurant;
import com.lamaisonorientale.horaire.dto.PublicRestaurantInfoDto;
import com.lamaisonorientale.horaire.dto.RestaurantInfoDto;
import com.lamaisonorientale.horaire.infrastructure.ParametreRestaurantRepository;

@ExtendWith(MockitoExtension.class)
class RestaurantInfoServiceTest {

    @Mock
    private ParametreRestaurantRepository parametreRepository;

    @InjectMocks
    private RestaurantInfoService restaurantInfoService;

    @Test
    void getInfo_ShouldReturnRestaurantInfoFromParameters() {
        when(parametreRepository.existsById(anyString())).thenReturn(true);
        when(parametreRepository.findById("nom_restaurant"))
                .thenReturn(Optional.of(param("nom_restaurant", "La Maison Orientale")));
        when(parametreRepository.findById("tagline"))
                .thenReturn(Optional.of(param("tagline", "Restaurant Snack BBQ & Shawarma au charbon")));
        when(parametreRepository.findById("cuisine"))
                .thenReturn(Optional.of(param("cuisine", "Cuisine syrienne")));
        when(parametreRepository.findById("services"))
                .thenReturn(Optional.of(param("services", "Sur place|À emporter")));
        when(parametreRepository.findById("adresse_rue"))
                .thenReturn(Optional.of(param("adresse_rue", "Rue Jules Destrée 219")));
        when(parametreRepository.findById("adresse_ville"))
                .thenReturn(Optional.of(param("adresse_ville", "7390 Quaregnon")));
        when(parametreRepository.findById("telephone"))
                .thenReturn(Optional.of(param("telephone", "0498 67 22 62")));
        when(parametreRepository.findById("email_contact"))
                .thenReturn(Optional.of(param("email_contact", "contact@lamaisonorientale.be")));
        when(parametreRepository.findById("instagram_url"))
                .thenReturn(Optional.of(param("instagram_url", "https://www.instagram.com/la_maisonorientale/")));
        when(parametreRepository.findById("tiktok_url"))
                .thenReturn(Optional.of(param("tiktok_url", "https://www.tiktok.com/@la_maisonorientale")));
        when(parametreRepository.findById("google_rating_score"))
                .thenReturn(Optional.of(param("google_rating_score", "4,6")));
        when(parametreRepository.findById("google_rating_count"))
                .thenReturn(Optional.of(param("google_rating_count", "50 avis")));
        when(parametreRepository.findById("google_reviews_url"))
                .thenReturn(Optional.of(param("google_reviews_url", "https://www.google.com/maps/")));

        RestaurantInfoDto info = restaurantInfoService.getInfo();

        assertThat(info.nom()).isEqualTo("La Maison Orientale");
        assertThat(info.services()).containsExactly("Sur place", "À emporter");
        assertThat(info.telephone()).isEqualTo("0498 67 22 62");
    }

    @Test
    void getPublicInfo_ShouldBuildPublicDto() {
        when(parametreRepository.existsById(anyString())).thenReturn(true);
        when(parametreRepository.findById("nom_restaurant"))
                .thenReturn(Optional.of(param("nom_restaurant", "La Maison Orientale")));
        when(parametreRepository.findById("tagline"))
                .thenReturn(Optional.of(param("tagline", "Tagline test")));
        when(parametreRepository.findById("cuisine"))
                .thenReturn(Optional.of(param("cuisine", "Cuisine syrienne")));
        when(parametreRepository.findById("services"))
                .thenReturn(Optional.of(param("services", "Sur place")));
        when(parametreRepository.findById("adresse_rue"))
                .thenReturn(Optional.of(param("adresse_rue", "Rue Test 1")));
        when(parametreRepository.findById("adresse_ville"))
                .thenReturn(Optional.of(param("adresse_ville", "7000 Mons")));
        when(parametreRepository.findById("telephone"))
                .thenReturn(Optional.of(param("telephone", "0498672262")));
        when(parametreRepository.findById("email_contact"))
                .thenReturn(Optional.of(param("email_contact", "contact@test.local")));
        when(parametreRepository.findById("instagram_url"))
                .thenReturn(Optional.of(param("instagram_url", "https://instagram.com/test")));
        when(parametreRepository.findById("tiktok_url"))
                .thenReturn(Optional.of(param("tiktok_url", "https://tiktok.com/@test")));
        when(parametreRepository.findById("google_rating_score"))
                .thenReturn(Optional.of(param("google_rating_score", "4,5")));
        when(parametreRepository.findById("google_rating_count"))
                .thenReturn(Optional.of(param("google_rating_count", "10 avis")));
        when(parametreRepository.findById("google_reviews_url"))
                .thenReturn(Optional.of(param("google_reviews_url", "https://google.com/maps")));

        PublicRestaurantInfoDto info = restaurantInfoService.getPublicInfo();

        assertThat(info.name()).isEqualTo("La Maison Orientale");
        assertThat(info.addressFull()).isEqualTo("Rue Test 1, 7000 Mons");
        assertThat(info.phoneHref()).isEqualTo("tel:+32498672262");
        assertThat(info.emailHref()).isEqualTo("mailto:contact@test.local");
    }

    private static ParametreRestaurant param(String key, String value) {
        ParametreRestaurant row = new ParametreRestaurant();
        row.setCle(key);
        row.setValeur(value);
        return row;
    }
}
