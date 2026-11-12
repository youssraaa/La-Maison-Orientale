package com.lamaisonorientale.demande.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

import com.lamaisonorientale.demande.application.AdminMessageService;
import com.lamaisonorientale.demande.dto.AdminMessageDto;
import com.lamaisonorientale.demande.dto.ReplyMessageRequest;
import com.lamaisonorientale.demande.dto.UpdateDemandeStatutRequest;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminMessageController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminMessageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminMessageService adminMessageService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private static AdminMessageDto sampleMessage(String statut) {
        return new AdminMessageDto(
                1L,
                "Dupont",
                "client@test.local",
                "0498672262",
                "Renseignements",
                "Bonjour, j'aimerais des informations.",
                "CONTACT",
                statut,
                Instant.parse("2026-08-01T10:00:00Z"),
                null,
                null,
                null);
    }

    @Test
    void list_ShouldReturnMessages() throws Exception {
        when(adminMessageService.list(null)).thenReturn(List.of(sampleMessage("NOUVELLE")));

        mockMvc.perform(get("/api/admin/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nom").value("Dupont"))
                .andExpect(jsonPath("$[0].statut").value("NOUVELLE"));
    }

    @Test
    void updateStatut_ShouldReturnUpdatedMessage() throws Exception {
        when(adminMessageService.updateStatut(eq(3L), any(UpdateDemandeStatutRequest.class)))
                .thenReturn(sampleMessage("TRAITEE"));

        mockMvc.perform(
                        put("/api/admin/messages/3/statut")
                                .contentType(APPLICATION_JSON)
                                .content("{\"statut\":\"TRAITEE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("TRAITEE"));

        verify(adminMessageService).updateStatut(eq(3L), any(UpdateDemandeStatutRequest.class));
    }

    @Test
    void reply_ShouldReturnRepliedMessage() throws Exception {
        when(adminMessageService.reply(eq(5L), any(ReplyMessageRequest.class)))
                .thenReturn(sampleMessage("TRAITEE"));

        mockMvc.perform(
                        post("/api/admin/messages/5/reply")
                                .contentType(APPLICATION_JSON)
                                .content("{\"reponse\":\"Merci pour votre message, nous revenons vers vous.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("TRAITEE"));

        verify(adminMessageService).reply(eq(5L), any(ReplyMessageRequest.class));
    }
}
