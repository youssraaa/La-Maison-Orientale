package com.lamaisonorientale.common.application;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.multipart.MultipartFile;

class ImageUploadServiceTest {

    private ImageUploadService imageUploadService;

    @BeforeEach
    void setUp() {
        imageUploadService = new ImageUploadService("target/test-uploads");
    }

    @Test
    void store_ShouldThrow_WhenFileIsEmpty() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);

        assertThatThrownBy(() -> imageUploadService.store(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Fichier requis");
    }

    @Test
    void store_ShouldThrow_WhenContentTypeIsNotAllowed() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");

        assertThatThrownBy(() -> imageUploadService.store(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Format non supporté");
    }
}
