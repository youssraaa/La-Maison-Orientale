package com.lamaisonorientale.reservation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lamaisonorientale.reservation.dto.ReservationRequestDto;
import com.lamaisonorientale.support.IntegrationTestFixtures;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReservationFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void submitGetAndCancelReservation_ShouldWorkOnPublicApi() throws Exception {
        LocalDate date = LocalDate.now().plusDays(14);
        while (date.getDayOfWeek().getValue() == 1) {
            date = date.plusDays(1);
        }

        ReservationRequestDto request = new ReservationRequestDto(
                "Integration Test",
                "0498672262",
                IntegrationTestFixtures.uniqueEmail("resa"),
                date,
                LocalTime.of(19, 0),
                2,
                "Table près de la fenêtre");

        MvcResult createResult = mockMvc.perform(post("/api/public/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.manageToken").isNotEmpty())
                .andReturn();

        JsonNode created = objectMapper.readTree(createResult.getResponse().getContentAsString());
        String token = created.get("manageToken").asText();
        assertThat(token).isNotBlank();

        mockMvc.perform(get("/api/public/reservations/manage/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomClient").value("Integration Test"))
                .andExpect(jsonPath("$.statut").value("CONFIRMEE"));

        mockMvc.perform(delete("/api/public/reservations/manage/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ANNULEE"));
    }
}
