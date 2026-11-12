package com.lamaisonorientale.horaire.api;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.horaire.application.HoraireService;
import com.lamaisonorientale.horaire.application.RestaurantInfoService;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
import com.lamaisonorientale.horaire.dto.PublicHoursDto;
import com.lamaisonorientale.horaire.dto.PublicOrderPolicyDto;
import com.lamaisonorientale.horaire.dto.PublicReservationPolicyDto;
import com.lamaisonorientale.horaire.dto.PublicRestaurantInfoDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(PublicRestaurantController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class PublicRestaurantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RestaurantInfoService restaurantInfoService;

    @MockitoBean
    private HoraireService horaireService;

    @MockitoBean
    private RestaurantSettingsService restaurantSettingsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getInfo_ShouldReturnPublicRestaurantInfo() throws Exception {
        when(restaurantInfoService.getPublicInfo())
                .thenReturn(new PublicRestaurantInfoDto(
                        "La Maison Orientale",
                        "Restaurant Snack BBQ & Shawarma au charbon",
                        "Cuisine syrienne",
                        List.of("Sur place"),
                        "Rue Jules Destrée 219",
                        "7390 Quaregnon",
                        "Rue Jules Destrée 219, 7390 Quaregnon",
                        "0498 67 22 62",
                        "tel:+32498672262",
                        "contact@lamaisonorientale.be",
                        "mailto:contact@lamaisonorientale.be",
                        "https://www.instagram.com/la_maisonorientale/",
                        "https://www.tiktok.com/@la_maisonorientale",
                        "4,6",
                        "50 avis",
                        "https://www.google.com/maps/"));

        mockMvc.perform(get("/api/public/restaurant/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("La Maison Orientale"))
                .andExpect(jsonPath("$.phoneDisplay").value("0498 67 22 62"));
    }

    @Test
    void getHours_ShouldReturnPublicHours() throws Exception {
        when(horaireService.getPublicHours())
                .thenReturn(new PublicHoursDto(
                        List.of(new PublicHoursDto.DaySchedule("Mardi", "12:00 – 22:30")),
                        "Mar–Dim 12:00 – 22:30 · Lun fermé"));

        mockMvc.perform(get("/api/public/restaurant/hours"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schedule[0].day").value("Mardi"))
                .andExpect(jsonPath("$.summary").exists());

        verify(horaireService).getPublicHours();
    }

    @Test
    void getReservationPolicy_ShouldReturnPolicy() throws Exception {
        when(restaurantSettingsService.getPublicPolicy())
                .thenReturn(new PublicReservationPolicyDto(10, 2, 90, 120, 50));

        mockMvc.perform(get("/api/public/restaurant/reservation-policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maxOnlineCovers").value(10))
                .andExpect(jsonPath("$.maxCoversPerSlot").value(50));

        verify(restaurantSettingsService).getPublicPolicy();
    }

    @Test
    void getOrderPolicy_ShouldReturnOrderPolicy() throws Exception {
        when(restaurantSettingsService.getPublicOrderPolicy())
                .thenReturn(new PublicOrderPolicyDto(
                        BigDecimal.valueOf(2.50), BigDecimal.valueOf(25.00)));

        mockMvc.perform(get("/api/public/restaurant/order-policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fraisLivraison").value(2.50))
                .andExpect(jsonPath("$.montantMinimumLivraison").value(25.00));

        verify(restaurantSettingsService).getPublicOrderPolicy();
    }
}
