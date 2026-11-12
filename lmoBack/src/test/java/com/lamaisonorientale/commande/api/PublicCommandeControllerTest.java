package com.lamaisonorientale.commande.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import com.lamaisonorientale.commande.dto.CommandeResponseDto;
import com.lamaisonorientale.commande.dto.PublicCommandeDetailDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(PublicCommandeController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class PublicCommandeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CommandeService commandeService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void submit_ShouldReturnCreatedCommande() throws Exception {
        when(commandeService.submit(org.mockito.ArgumentMatchers.any()))
                .thenReturn(new CommandeResponseDto(
                        10L,
                        "CMD-010",
                        "Commande enregistrée",
                        "EMPORTER",
                        "EN_ATTENTE",
                        BigDecimal.valueOf(25.00),
                        "token-cmd",
                        "http://localhost:3000/commande/gerer/token-cmd",
                        Instant.now(),
                        List.of(new CommandeResponseDto.LigneDto(
                                "Tajine", BigDecimal.valueOf(25.00), 1, BigDecimal.valueOf(25.00)))));

        mockMvc.perform(
                        post("/api/public/commandes")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "mode": "EMPORTER",
                                          "nom": "Dupont",
                                          "email": "client@test.local",
                                          "telephone": "0498672262",
                                          "lignes": [{"platId": 1, "quantite": 1}]
                                        }
                                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reference").value("CMD-010"))
                .andExpect(jsonPath("$.manageToken").value("token-cmd"));
    }

    @Test
    void get_ShouldReturnCommandeDetail() throws Exception {
        when(commandeService.getByToken("token-cmd"))
                .thenReturn(new PublicCommandeDetailDto(
                        10L,
                        "CMD-010",
                        "EMPORTER",
                        "EN_ATTENTE",
                        "Dupont",
                        BigDecimal.valueOf(25.00),
                        null,
                        null,
                        "CARTE",
                        Instant.now(),
                        List.of(new PublicCommandeDetailDto.LigneDto(
                                "Tajine", BigDecimal.valueOf(25.00), 1, BigDecimal.valueOf(25.00))),
                        true,
                        "token-cmd"));

        mockMvc.perform(get("/api/public/commandes/manage/token-cmd"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reference").value("CMD-010"));
    }

    @Test
    void cancel_ShouldReturnCancelledCommande() throws Exception {
        when(commandeService.cancelByToken(eq("token-cmd")))
                .thenReturn(new PublicCommandeDetailDto(
                        10L,
                        "CMD-010",
                        "EMPORTER",
                        "ANNULEE",
                        "Dupont",
                        BigDecimal.valueOf(25.00),
                        null,
                        null,
                        "CARTE",
                        Instant.now(),
                        List.of(),
                        false,
                        "token-cmd"));

        mockMvc.perform(delete("/api/public/commandes/manage/token-cmd"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ANNULEE"));

        verify(commandeService).cancelByToken("token-cmd");
    }
}
