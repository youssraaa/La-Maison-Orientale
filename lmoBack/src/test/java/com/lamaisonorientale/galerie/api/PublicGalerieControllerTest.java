package com.lamaisonorientale.galerie.api;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.galerie.application.GalerieService;
import com.lamaisonorientale.galerie.dto.PublicGaleriePhotoDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(PublicGalerieController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class PublicGalerieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GalerieService galerieService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void list_ShouldReturnAllActivePhotos() throws Exception {
        when(galerieService.listPublic(false))
                .thenReturn(List.of(
                        new PublicGaleriePhotoDto("/uploads/salle.jpg", "Salle principale"),
                        new PublicGaleriePhotoDto("/uploads/terrasse.jpg", "Terrasse")));

        mockMvc.perform(get("/api/public/galerie"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].src").value("/uploads/salle.jpg"))
                .andExpect(jsonPath("$[1].alt").value("Terrasse"));

        verify(galerieService).listPublic(false);
    }

    @Test
    void list_ShouldReturnAccueilPhotos_WhenAccueilTrue() throws Exception {
        when(galerieService.listPublic(true))
                .thenReturn(List.of(new PublicGaleriePhotoDto("/uploads/accueil.jpg", "Accueil")));

        mockMvc.perform(get("/api/public/galerie").param("accueil", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].src").value("/uploads/accueil.jpg"))
                .andExpect(jsonPath("$[0].alt").value("Accueil"));

        verify(galerieService).listPublic(true);
    }
}
