package com.lamaisonorientale.user.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import com.lamaisonorientale.user.application.AgentManagementService;
import com.lamaisonorientale.user.dto.AgentResponseDto;

@WebMvcTest(AgentManagementController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AgentManagementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AgentManagementService agentManagementService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void list_ShouldReturnAgents() throws Exception {
        when(agentManagementService.listAgents())
                .thenReturn(List.of(new AgentResponseDto(
                        2L,
                        "Marie",
                        "Agent",
                        "agent@test.local",
                        "AGENT",
                        true,
                        false,
                        Instant.parse("2026-01-01T00:00:00Z"))));

        mockMvc.perform(get("/api/admin/agents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("agent@test.local"))
                .andExpect(jsonPath("$[0].role").value("AGENT"));
    }

    @Test
    void create_ShouldReturnCreatedAgent() throws Exception {
        when(agentManagementService.create(any()))
                .thenReturn(new AgentResponseDto(
                        3L,
                        "Paul",
                        "Nouveau",
                        "nouveau.agent@test.local",
                        "AGENT",
                        false,
                        true,
                        Instant.now()));

        mockMvc.perform(
                        post("/api/admin/agents")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "prenom": "Paul",
                                          "nom": "Nouveau",
                                          "email": "nouveau.agent@test.local"
                                        }
                                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("nouveau.agent@test.local"))
                .andExpect(jsonPath("$.invitationEnAttente").value(true));
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/admin/agents/3")).andExpect(status().isNoContent());

        verify(agentManagementService).delete(3L);
    }
}
