package com.lamaisonorientale.common.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.common.application.ImageUploadService;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminUploadController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminUploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ImageUploadService imageUploadService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void uploadImage_ShouldReturnStoredUrl() throws Exception {
        when(imageUploadService.store(any())).thenReturn("/uploads/test-image.jpg");

        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});

        mockMvc.perform(multipart("/api/admin/upload/image").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("/uploads/test-image.jpg"));
    }
}
