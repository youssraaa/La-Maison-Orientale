package com.lamaisonorientale.reservation.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.reservation.application.AdminReservationService;
import com.lamaisonorientale.reservation.dto.AdminReservationDto;
import com.lamaisonorientale.reservation.dto.UpdateReservationStatutRequest;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminReservationController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminReservationService adminReservationService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void list_ShouldReturnReservations() throws Exception {
        when(adminReservationService.list(null, null))
                .thenReturn(List.of(new AdminReservationDto(
                        1L,
                        LocalDate.of(2026, 9, 1),
                        LocalTime.of(19, 30),
                        4,
                        "Dupont",
                        "client@test.local",
                        "0498672262",
                        "Anniversaire",
                        "CONFIRMEE",
                        Instant.parse("2026-08-01T10:00:00Z"))));

        mockMvc.perform(get("/api/admin/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nomClient").value("Dupont"))
                .andExpect(jsonPath("$[0].statut").value("CONFIRMEE"));
    }

    @Test
    void updateStatut_ShouldReturnUpdatedReservation() throws Exception {
        when(adminReservationService.updateStatut(eq(5L), eq(new UpdateReservationStatutRequest("ANNULEE"))))
                .thenReturn(new AdminReservationDto(
                        5L,
                        LocalDate.of(2026, 9, 1),
                        LocalTime.of(20, 0),
                        2,
                        "Martin",
                        "martin@test.local",
                        "0498123456",
                        null,
                        "ANNULEE",
                        Instant.now()));

        mockMvc.perform(
                        put("/api/admin/reservations/5/statut")
                                .contentType(APPLICATION_JSON)
                                .content("{\"statut\":\"ANNULEE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ANNULEE"));

        verify(adminReservationService).updateStatut(5L, new UpdateReservationStatutRequest("ANNULEE"));
    }
}
