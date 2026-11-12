package com.lamaisonorientale.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lamaisonorientale.security.dto.SignInRequest;
import com.lamaisonorientale.support.IntegrationTestFixtures;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAccessIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void publicRoute_Health_ShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/health")).andExpect(status().isOk());
    }

    @Test
    void protectedRoute_ClientMe_WithoutAuthentication_ShouldBeRejected() throws Exception {
        mockMvc.perform(get("/api/client/me")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void protectedRoute_AdminHoraires_ShouldBeAccessibleForStaff() throws Exception {
        mockMvc.perform(get("/api/admin/horaires")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void protectedRoute_AdminHoraires_ShouldBeForbiddenForClient() throws Exception {
        mockMvc.perform(get("/api/admin/horaires")).andExpect(status().isForbidden());
    }

    @Test
    void clientSignin_WithWrongCredentials_ShouldReturnUnauthorized() throws Exception {
        SignInRequest request = SignInRequest.builder()
                .email("inconnu@test.local")
                .password("wrong-password")
                .build();

        mockMvc.perform(post("/api/auth/client/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clientSignupAndSignin_ShouldSucceed() throws Exception {
        String email = IntegrationTestFixtures.uniqueEmail("client");
        String token = IntegrationTestFixtures.registerClientAndGetToken(mockMvc, objectMapper, email);

        mockMvc.perform(get("/api/client/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
