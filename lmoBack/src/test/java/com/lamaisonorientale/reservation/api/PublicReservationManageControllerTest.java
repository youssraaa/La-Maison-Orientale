package com.lamaisonorientale.reservation.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.reservation.application.ReservationService;
import com.lamaisonorientale.reservation.dto.PublicReservationDetailDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(PublicReservationManageController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class PublicReservationManageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReservationService reservationService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void get_ShouldReturnReservationDetail() throws Exception {
        when(reservationService.getByToken("token-abc"))
                .thenReturn(new PublicReservationDetailDto(
                        7L,
                        LocalDate.of(2026, 10, 12),
                        LocalTime.of(20, 0),
                        3,
                        "Martin",
                        "martin@test.local",
                        "0498123456",
                        null,
                        "CONFIRMEE",
                        Instant.now(),
                        true,
                        true,
                        "token-abc"));

        mockMvc.perform(get("/api/public/reservations/manage/token-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.gestionToken").value("token-abc"));
    }

    @Test
    void cancel_ShouldReturnCancelledReservation() throws Exception {
        when(reservationService.cancelByToken(eq("token-abc")))
                .thenReturn(new PublicReservationDetailDto(
                        7L,
                        LocalDate.of(2026, 10, 12),
                        LocalTime.of(20, 0),
                        3,
                        "Martin",
                        "martin@test.local",
                        "0498123456",
                        null,
                        "ANNULEE",
                        Instant.now(),
                        false,
                        false,
                        "token-abc"));

        mockMvc.perform(delete("/api/public/reservations/manage/token-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ANNULEE"));
    }
}
