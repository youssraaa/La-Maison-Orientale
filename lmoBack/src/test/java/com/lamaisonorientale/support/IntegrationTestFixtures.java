package com.lamaisonorientale.support;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lamaisonorientale.security.dto.SignInRequest;
import com.lamaisonorientale.user.dto.ClientSignUpRequest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public final class IntegrationTestFixtures {

    private IntegrationTestFixtures() {}

    public static String uniqueEmail(String prefix) {
        return prefix + "_" + System.currentTimeMillis() + "@test.local";
    }

    public static ClientSignUpRequest clientSignUp(String email) {
        return new ClientSignUpRequest("Dupont", email, "password123", "0498672262");
    }

    public static SignInRequest signIn(String email) {
        return SignInRequest.builder().email(email).password("password123").build();
    }

    public static String registerClientAndGetToken(MockMvc mockMvc, ObjectMapper objectMapper, String email)
            throws Exception {
        mockMvc.perform(
                        post("/api/auth/client/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(clientSignUp(email))))
                .andExpect(status().isCreated());

        return signInAndGetToken(mockMvc, objectMapper, email);
    }

    public static String signInAndGetToken(MockMvc mockMvc, ObjectMapper objectMapper, String email)
            throws Exception {
        String body =
                mockMvc.perform(
                                post("/api/auth/client/signin")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(signIn(email))))
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

        JsonNode json = objectMapper.readTree(body);
        return json.get("token").asText();
    }
}
