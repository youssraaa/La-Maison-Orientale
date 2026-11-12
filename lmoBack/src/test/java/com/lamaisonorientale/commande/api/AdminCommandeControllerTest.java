package com.lamaisonorientale.commande.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.commande.application.CommandeService;
import com.lamaisonorientale.commande.dto.AdminCommandeDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminCommandeController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminCommandeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CommandeService commandeService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void list_ShouldReturnCommandes() throws Exception {
        when(commandeService.listAllAdmin(null))
                .thenReturn(List.of(new AdminCommandeDto(
                        1L,
                        "CMD-001",
                        "LIVRAISON",
                        "EN_ATTENTE",
                        "Dupont",
                        "client@test.local",
                        "0498672262",
                        "Rue Test 1, 7000 Mons",
                        "Sans oignons",
                        "CARTE",
                        BigDecimal.valueOf(42.50),
                        Instant.parse("2026-08-01T10:00:00Z"),
                        List.of(new AdminCommandeDto.LigneDto("Couscous", BigDecimal.valueOf(21.25), 2)))));

        mockMvc.perform(get("/api/admin/commandes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reference").value("CMD-001"))
                .andExpect(jsonPath("$[0].statut").value("EN_ATTENTE"));
    }

    @Test
    void updateStatut_ShouldReturnUpdatedCommande() throws Exception {
        when(commandeService.updateStatut(eq(5L), eq("CONFIRMEE")))
                .thenReturn(new AdminCommandeDto(
                        5L,
                        "CMD-005",
                        "EMPORTER",
                        "CONFIRMEE",
                        "Martin",
                        "martin@test.local",
                        "0498123456",
                        null,
                        null,
                        "ESPECES",
                        BigDecimal.valueOf(18.00),
                        Instant.now(),
                        List.of()));

        mockMvc.perform(
                        patch("/api/admin/commandes/5/statut")
                                .contentType(APPLICATION_JSON)
                                .content("{\"statut\":\"CONFIRMEE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("CONFIRMEE"));

        verify(commandeService).updateStatut(5L, "CONFIRMEE");
    }
}
