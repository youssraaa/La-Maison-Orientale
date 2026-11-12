package com.lamaisonorientale.user.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.security.JwtAuthenticationFilter;
import com.lamaisonorientale.user.application.ClientAccountService;
import com.lamaisonorientale.reservation.dto.PublicReservationDetailDto;
import com.lamaisonorientale.user.dto.ClientProfileDto;

@WebMvcTest(ClientAccountController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class ClientAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClientAccountService clientAccountService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void reservations_ShouldReturnList() throws Exception {
        when(clientAccountService.myReservations())
                .thenReturn(List.of(new PublicReservationDetailDto(
                        1L,
                        java.time.LocalDate.of(2026, 9, 1),
                        java.time.LocalTime.of(19, 30),
                        4,
                        "Dupont",
                        "client@test.local",
                        "0498672262",
                        "Anniversaire",
                        "CONFIRMEE",
                        Instant.parse("2026-08-01T10:00:00Z"),
                        true,
                        true,
                        "gestion-token")));

        mockMvc.perform(get("/api/client/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nbPersonnes").value(4))
                .andExpect(jsonPath("$[0].statut").value("CONFIRMEE"));
    }

    @Test
    void profile_ShouldReturnClientProfile() throws Exception {
        when(clientAccountService.profile())
                .thenReturn(new ClientProfileDto(
                        1L,
                        "Dupont",
                        "Marie",
                        "client@test.local",
                        "0498672262",
                        "Belgique",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        Instant.now()));

        mockMvc.perform(get("/api/client/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("client@test.local"))
                .andExpect(jsonPath("$.prenom").value("Marie"));
    }

    @Test
    void commandes_ShouldReturnList() throws Exception {
        when(clientAccountService.myCommandes()).thenReturn(List.of());

        mockMvc.perform(get("/api/client/commandes")).andExpect(status().isOk());
    }

    @Test
    void messages_ShouldReturnList() throws Exception {
        when(clientAccountService.myMessages())
                .thenReturn(List.of(new com.lamaisonorientale.user.dto.ClientMessageDto(
                        1L,
                        "Question horaires",
                        "Bonjour, ouvert le lundi ?",
                        "NOUVELLE",
                        Instant.parse("2026-08-01T10:00:00Z"),
                        null,
                        null)));

        mockMvc.perform(get("/api/client/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sujet").value("Question horaires"))
                .andExpect(jsonPath("$[0].statut").value("NOUVELLE"));
    }
}
