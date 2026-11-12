package com.lamaisonorientale.reservation.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

import com.lamaisonorientale.reservation.application.ReservationService;
import com.lamaisonorientale.reservation.dto.AvailabilityResponseDto;
import com.lamaisonorientale.reservation.dto.ReservationResponseDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(ReservationController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReservationService reservationService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void availability_ShouldReturnSlots() throws Exception {
        LocalDate date = LocalDate.of(2026, 9, 15);
        when(reservationService.getAvailability(eq(date), eq(2)))
                .thenReturn(new AvailabilityResponseDto(
                        date,
                        false,
                        20,
                        List.of(new AvailabilityResponseDto.SlotAvailabilityDto("19:00", true, 4, "19:00"))));

        mockMvc.perform(get("/api/public/reservations/availability")
                        .param("date", "2026-09-15")
                        .param("nbPersonnes", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date").value("2026-09-15"))
                .andExpect(jsonPath("$.closed").value(false))
                .andExpect(jsonPath("$.slots[0].time").value("19:00"))
                .andExpect(jsonPath("$.slots[0].available").value(true));

        verify(reservationService).getAvailability(date, 2);
    }

    @Test
    void submit_ShouldReturnCreatedReservation() throws Exception {
        when(reservationService.submit(any()))
                .thenReturn(new ReservationResponseDto(
                        12L,
                        "Réservation confirmée",
                        LocalDate.of(2026, 9, 15),
                        LocalTime.of(19, 0),
                        2,
                        "CONFIRMEE",
                        Instant.parse("2026-08-01T10:00:00Z"),
                        "token-resa",
                        "http://localhost:3000/reservation/gerer/token-resa"));

        mockMvc.perform(
                        post("/api/public/reservations")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "nom": "Dupont",
                                          "telephone": "0498672262",
                                          "email": "client@test.local",
                                          "date": "2026-09-15",
                                          "heure": "19:00",
                                          "nbPersonnes": 2,
                                          "commentaire": "Anniversaire"
                                        }
                                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(12))
                .andExpect(jsonPath("$.manageToken").value("token-resa"))
                .andExpect(jsonPath("$.statut").value("CONFIRMEE"));
    }
}
