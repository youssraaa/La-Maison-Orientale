package com.lamaisonorientale.client.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

import com.lamaisonorientale.client.application.AdminClientService;
import com.lamaisonorientale.client.dto.AdminClientDetailDto;
import com.lamaisonorientale.client.dto.AdminClientDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminClientController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminClientService adminClientService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void list_ShouldReturnClients() throws Exception {
        when(adminClientService.listClients())
                .thenReturn(List.of(new AdminClientDto(
                        "Dupont",
                        "client@test.local",
                        "0498672262",
                        3,
                        2,
                        1,
                        Instant.parse("2026-07-01T10:00:00Z"),
                        Instant.parse("2026-08-01T10:00:00Z"),
                        "Rue de la Paix 10, 1000 Bruxelles")));

        mockMvc.perform(get("/api/admin/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nom").value("Dupont"))
                .andExpect(jsonPath("$[0].nbReservations").value(3));
    }

    @Test
    void detail_ShouldReturnClientDetail() throws Exception {
        when(adminClientService.getClientDetail("client@test.local", null, null))
                .thenReturn(new AdminClientDetailDto(
                        "Dupont",
                        "client@test.local",
                        "0498672262",
                        List.of(new AdminClientDetailDto.ClientReservationItemDto(
                                1L,
                                LocalDate.of(2026, 9, 1),
                                LocalTime.of(19, 0),
                                2,
                                "CONFIRMEE",
                                Instant.parse("2026-08-01T10:00:00Z"))),
                        List.of(),
                        List.of()));

        mockMvc.perform(get("/api/admin/clients/detail").param("email", "client@test.local"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("client@test.local"))
                .andExpect(jsonPath("$.reservations[0].statut").value("CONFIRMEE"));
    }
}
