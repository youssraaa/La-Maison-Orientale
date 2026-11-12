package com.lamaisonorientale.demande.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.demande.application.ContactService;
import com.lamaisonorientale.demande.dto.ContactResponseDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(ContactController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactService contactService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void submit_ShouldReturnCreatedContactResponse() throws Exception {
        when(contactService.submit(any()))
                .thenReturn(new ContactResponseDto(
                        7L,
                        "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.",
                        Instant.parse("2026-08-01T10:00:00Z")));

        mockMvc.perform(
                        post("/api/public/contact")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "nom": "Dupont",
                                          "email": "client@test.local",
                                          "telephone": "0498672262",
                                          "sujet": "Renseignements",
                                          "message": "Bonjour, j'aimerais des informations sur vos menus."
                                        }
                                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.message").value(
                        "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais."));

        verify(contactService).submit(any());
    }
}
