package com.lamaisonorientale.security.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lamaisonorientale.security.JwtAuthenticationFilter;
import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.security.dto.SignInRequest;
import com.lamaisonorientale.security.services.AuthenticationService;
import com.lamaisonorientale.user.application.AgentInvitationService;
import com.lamaisonorientale.user.dto.ClientSignUpRequest;

@WebMvcTest(AuthenticationController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthenticationService authenticationService;

    @MockitoBean
    private AgentInvitationService agentInvitationService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void clientSignup_ShouldReturnToken() throws Exception {
        ClientSignUpRequest request =
                new ClientSignUpRequest("Dupont", "client@test.local", "password123", "0498672262");

        when(authenticationService.signupClient(any(ClientSignUpRequest.class)))
                .thenReturn(JwtAuthenticationResponse.builder()
                        .token("token-signup")
                        .role("CLIENT")
                        .build());

        mockMvc.perform(post("/api/auth/client/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("token-signup"))
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }

    @Test
    void clientSignin_ShouldReturnToken() throws Exception {
        SignInRequest request =
                SignInRequest.builder().email("client@test.local").password("password123").build();

        when(authenticationService.signinClient(any(SignInRequest.class)))
                .thenReturn(JwtAuthenticationResponse.builder()
                        .token("token-signin")
                        .role("CLIENT")
                        .build());

        mockMvc.perform(post("/api/auth/client/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-signin"))
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }
}
