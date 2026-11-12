package com.lamaisonorientale.menu.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import com.lamaisonorientale.menu.dto.PublicMenuDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(PublicMenuController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class PublicMenuControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MenuService menuService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getMenu_ShouldReturnPublicMenu() throws Exception {
        when(menuService.publicMenu())
                .thenReturn(new PublicMenuDto(List.of(new PublicMenuDto.PublicCategoryDto(
                        "entrees",
                        "Entrées",
                        null,
                        null,
                        List.of(new PublicMenuDto.PublicItemDto(
                                1L, "Salade orientale", "Fraîche", BigDecimal.valueOf(8.50), null, null, true, true)),
                        null))));

        mockMvc.perform(get("/api/public/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories[0].id").value("entrees"))
                .andExpect(jsonPath("$.categories[0].title").value("Entrées"))
                .andExpect(jsonPath("$.categories[0].items[0].name").value("Salade orientale"));
    }
}
