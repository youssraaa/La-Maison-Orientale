package com.lamaisonorientale.horaire.api;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalTime;
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
import com.lamaisonorientale.horaire.dto.HoraireDto;
import com.lamaisonorientale.horaire.dto.RestaurantInfoDto;
import com.lamaisonorientale.horaire.dto.RestaurantSettingsDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminHoraireController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminHoraireControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HoraireService horaireService;

    @MockitoBean
    private RestaurantSettingsService restaurantSettingsService;

    @MockitoBean
    private RestaurantInfoService restaurantInfoService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void listHoraires_ShouldReturnHoraires() throws Exception {
        when(horaireService.listHoraires())
                .thenReturn(List.of(new HoraireDto(
                        1L,
                        (short) 2,
                        "Mardi",
                        LocalTime.of(12, 0),
                        LocalTime.of(22, 30),
                        true)));

        mockMvc.perform(get("/api/admin/horaires"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].jourLabel").value("Mardi"))
                .andExpect(jsonPath("$[0].actif").value(true));
    }

    @Test
    void getSettings_ShouldReturnSettings() throws Exception {
        when(restaurantSettingsService.getSettings())
                .thenReturn(new RestaurantSettingsDto(
                        50, 34, 16, 30, 90, 120, 2, 10, 60, "12:00", "22:30", "",
                        BigDecimal.valueOf(2.50), BigDecimal.valueOf(25.00)));

        mockMvc.perform(get("/api/admin/restaurant/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.capaciteMaxCreneau").value(50))
                .andExpect(jsonPath("$.heureOuvertureDefaut").value("12:00"));

        verify(restaurantSettingsService).getSettings();
    }

    @Test
    void getInfo_ShouldReturnRestaurantInfo() throws Exception {
        when(restaurantInfoService.getInfo())
                .thenReturn(new RestaurantInfoDto(
                        "La Maison Orientale",
                        "Restaurant Snack BBQ & Shawarma au charbon",
                        "Cuisine syrienne",
                        List.of("Sur place", "À emporter"),
                        "Rue Jules Destrée 219",
                        "7390 Quaregnon",
                        "0498 67 22 62",
                        "contact@lamaisonorientale.be",
                        "https://www.instagram.com/la_maisonorientale/",
                        "https://www.tiktok.com/@la_maisonorientale",
                        "4,6",
                        "50 avis",
                        "https://www.google.com/maps/"));

        mockMvc.perform(get("/api/admin/restaurant/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("La Maison Orientale"))
                .andExpect(jsonPath("$.telephone").value("0498 67 22 62"));

        verify(restaurantInfoService).getInfo();
    }
}
