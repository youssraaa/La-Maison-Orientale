package com.lamaisonorientale.menu;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MenuIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getPublicMenu_ShouldReturnSeededCategories() throws Exception {
        mockMvc.perform(get("/api/public/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories").isArray())
                .andExpect(jsonPath("$.categories[0]").exists())
                .andExpect(jsonPath("$.categories[0].title").isNotEmpty())
                .andExpect(jsonPath("$.categories[0].items[0].name").isNotEmpty())
                .andExpect(jsonPath("$.categories[0].items[0].price").isNumber());
    }
}
