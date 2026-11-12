package com.lamaisonorientale.commande;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lamaisonorientale.support.IntegrationTestFixtures;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CommandeFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void submitEmporterOrder_ShouldWorkAfterFetchingMenu() throws Exception {
        MvcResult menuResult = mockMvc.perform(get("/api/public/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories").isArray())
                .andReturn();

        JsonNode menu = objectMapper.readTree(menuResult.getResponse().getContentAsString());
        Long platId = findFirstPlatId(menu);
        assertThat(platId).isNotNull();

        String email = IntegrationTestFixtures.uniqueEmail("commande");

        MvcResult orderResult = mockMvc.perform(
                        post("/api/public/commandes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "mode": "EMPORTER",
                                          "nom": "Integration Test",
                                          "email": "%s",
                                          "telephone": "0498672262",
                                          "modePaiement": "ESPECES",
                                          "lignes": [{"platId": %d, "quantite": 1}]
                                        }
                                        """
                                                .formatted(email, platId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reference").isNotEmpty())
                .andExpect(jsonPath("$.manageToken").isNotEmpty())
                .andReturn();

        JsonNode order = objectMapper.readTree(orderResult.getResponse().getContentAsString());
        String token = order.get("manageToken").asText();

        mockMvc.perform(get("/api/public/commandes/manage/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomClient").value("Integration Test"))
                .andExpect(jsonPath("$.mode").value("EMPORTER"));
    }

    private Long findFirstPlatId(JsonNode menu) {
        for (JsonNode category : menu.get("categories")) {
            JsonNode items = category.get("items");
            if (items != null && items.isArray() && !items.isEmpty()) {
                return items.get(0).get("id").asLong();
            }
            JsonNode subsections = category.get("subsections");
            if (subsections != null && subsections.isArray()) {
                for (JsonNode subsection : subsections) {
                    JsonNode subItems = subsection.get("items");
                    if (subItems != null && subItems.isArray() && !subItems.isEmpty()) {
                        return subItems.get(0).get("id").asLong();
                    }
                }
            }
        }
        return null;
    }
}
