package com.lamaisonorientale.galerie.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.galerie.domain.GaleriePhoto;
import com.lamaisonorientale.galerie.dto.GaleriePhotoDto;
import com.lamaisonorientale.galerie.dto.PublicGaleriePhotoDto;
import com.lamaisonorientale.galerie.dto.UpsertGaleriePhotoRequest;
import com.lamaisonorientale.galerie.infrastructure.GaleriePhotoRepository;

@ExtendWith(MockitoExtension.class)
class GalerieServiceTest {

    @Mock
    private GaleriePhotoRepository galeriePhotoRepository;

    @InjectMocks
    private GalerieService galerieService;

    private GaleriePhoto photo;

    @BeforeEach
    void setUp() {
        photo = new GaleriePhoto();
        photo.setImageUrl("/uploads/salle.jpg");
        photo.setAlt("Salle principale");
        photo.setOrdreAffichage(1);
        photo.setActive(true);
        photo.setAfficherAccueil(true);
        ReflectionTestUtils.setField(photo, "id", 1L);
    }

    @Test
    void listAdmin_ShouldMapAllPhotos() {
        when(galeriePhotoRepository.findAllByOrderByOrdreAffichageAscIdAsc()).thenReturn(List.of(photo));

        List<GaleriePhotoDto> result = galerieService.listAdmin();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(1L);
        assertThat(result.get(0).imageUrl()).isEqualTo("/uploads/salle.jpg");
        assertThat(result.get(0).afficherAccueil()).isTrue();
    }

    @Test
    void create_ShouldPersistPhoto() {
        ArgumentCaptor<GaleriePhoto> captor = ArgumentCaptor.forClass(GaleriePhoto.class);
        when(galeriePhotoRepository.save(any(GaleriePhoto.class))).thenAnswer(invocation -> {
            GaleriePhoto saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 3L);
            return saved;
        });

        GaleriePhotoDto created = galerieService.create(new UpsertGaleriePhotoRequest(
                "/uploads/nouvelle.jpg", "Nouvelle photo", 2, true, false));

        verify(galeriePhotoRepository).save(captor.capture());
        GaleriePhoto saved = captor.getValue();
        assertThat(saved.getImageUrl()).isEqualTo("/uploads/nouvelle.jpg");
        assertThat(saved.getAlt()).isEqualTo("Nouvelle photo");
        assertThat(saved.getOrdreAffichage()).isEqualTo(2);
        assertThat(saved.getAfficherAccueil()).isFalse();
        assertThat(created.id()).isEqualTo(3L);
    }

    @Test
    void delete_ShouldRemoveExistingPhoto() {
        when(galeriePhotoRepository.existsById(1L)).thenReturn(true);

        galerieService.delete(1L);

        verify(galeriePhotoRepository).deleteById(1L);
    }

    @Test
    void delete_ShouldThrowWhenPhotoMissing() {
        when(galeriePhotoRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> galerieService.delete(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Photo introuvable");
    }

    @Test
    void listPublic_ShouldReturnAccueilPhotosOnly() {
        when(galeriePhotoRepository.findByActiveTrueAndAfficherAccueilTrueOrderByOrdreAffichageAscIdAsc())
                .thenReturn(List.of(photo));

        List<PublicGaleriePhotoDto> result = galerieService.listPublic(true);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).src()).isEqualTo("/uploads/salle.jpg");
        assertThat(result.get(0).alt()).isEqualTo("Salle principale");
    }

    @Test
    void update_ShouldApplyChanges() {
        when(galeriePhotoRepository.findById(1L)).thenReturn(Optional.of(photo));
        when(galeriePhotoRepository.save(any(GaleriePhoto.class))).thenAnswer(inv -> inv.getArgument(0));

        GaleriePhotoDto updated = galerieService.update(
                1L, new UpsertGaleriePhotoRequest("/uploads/updated.jpg", "Mise à jour", 5, false, true));

        assertThat(updated.imageUrl()).isEqualTo("/uploads/updated.jpg");
        assertThat(updated.active()).isFalse();
        assertThat(photo.getOrdreAffichage()).isEqualTo(5);
    }
}
