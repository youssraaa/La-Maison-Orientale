package com.lamaisonorientale.menu.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.menu.application.MenuService;
import com.lamaisonorientale.menu.dto.CategorieDto;
import com.lamaisonorientale.menu.dto.PlatDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminMenuController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminMenuControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MenuService menuService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void listCategories_ShouldReturnCategories() throws Exception {
        when(menuService.listCategories())
                .thenReturn(List.of(new CategorieDto(
                        1L, "Entrées", "entrees", null, null, 0, true)));

        mockMvc.perform(get("/api/admin/menu/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nom").value("Entrées"))
                .andExpect(jsonPath("$[0].slug").value("entrees"));
    }

    @Test
    void createCategorie_ShouldReturnCreatedCategory() throws Exception {
        when(menuService.createCategorie(any()))
                .thenReturn(new CategorieDto(
                        2L, "Desserts", "desserts", "/img/desserts.jpg", null, 1, true));

        mockMvc.perform(
                        post("/api/admin/menu/categories")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "nom": "Desserts",
                                          "slug": "desserts",
                                          "ordreAffichage": 1,
                                          "active": true
                                        }
                                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("Desserts"))
                .andExpect(jsonPath("$.slug").value("desserts"));

        verify(menuService).createCategorie(any());
    }

    @Test
    void listPlats_ShouldReturnPlats() throws Exception {
        when(menuService.listPlats(null))
                .thenReturn(List.of(new PlatDto(
                        10L,
                        1L,
                        "Couscous royal",
                        "Agneau et légumes",
                        BigDecimal.valueOf(18.50),
                        true,
                        true,
                        null,
                        0,
                        null,
                        false)));

        mockMvc.perform(get("/api/admin/menu/plats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nom").value("Couscous royal"))
                .andExpect(jsonPath("$[0].prix").value(18.50));
    }
}
