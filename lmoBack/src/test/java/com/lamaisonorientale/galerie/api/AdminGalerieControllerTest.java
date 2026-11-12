package com.lamaisonorientale.galerie.api;

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

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.galerie.application.GalerieService;
import com.lamaisonorientale.galerie.dto.GaleriePhotoDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminGalerieController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminGalerieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GalerieService galerieService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private static GaleriePhotoDto samplePhoto() {
        return new GaleriePhotoDto(1L, "/uploads/salle.jpg", "Salle principale", 0, true, true);
    }

    @Test
    void list_ShouldReturnPhotos() throws Exception {
        when(galerieService.listAdmin()).thenReturn(List.of(samplePhoto()));

        mockMvc.perform(get("/api/admin/galerie"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].imageUrl").value("/uploads/salle.jpg"))
                .andExpect(jsonPath("$[0].afficherAccueil").value(true));
    }

    @Test
    void create_ShouldReturnCreatedPhoto() throws Exception {
        when(galerieService.create(any())).thenReturn(samplePhoto());

        mockMvc.perform(
                        post("/api/admin/galerie")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "imageUrl": "/uploads/salle.jpg",
                                          "alt": "Salle principale",
                                          "ordreAffichage": 0,
                                          "active": true,
                                          "afficherAccueil": true
                                        }
                                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.alt").value("Salle principale"));

        verify(galerieService).create(any());
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/admin/galerie/4")).andExpect(status().isNoContent());

        verify(galerieService).delete(eq(4L));
    }
}
