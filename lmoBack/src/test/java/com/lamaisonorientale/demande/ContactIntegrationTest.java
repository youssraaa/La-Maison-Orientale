package com.lamaisonorientale.demande;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.support.IntegrationTestFixtures;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContactIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void submitContact_ShouldReturnCreated() throws Exception {
        String email = IntegrationTestFixtures.uniqueEmail("contact");

        mockMvc.perform(
                        post("/api/public/contact")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "nom": "Integration Test",
                                          "email": "%s",
                                          "telephone": "0498672262",
                                          "sujet": "Question menu",
                                          "message": "Bonjour, j'aimerais des informations sur vos plats végétariens."
                                        }
                                        """
                                                .formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
