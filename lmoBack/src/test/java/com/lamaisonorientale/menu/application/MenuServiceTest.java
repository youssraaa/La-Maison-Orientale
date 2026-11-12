package com.lamaisonorientale.menu.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.menu.domain.Categorie;
import com.lamaisonorientale.menu.dto.CategorieDto;
import com.lamaisonorientale.menu.infrastructure.CategorieRepository;
import com.lamaisonorientale.menu.infrastructure.PlatRepository;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock
    private CategorieRepository categorieRepository;

    @Mock
    private PlatRepository platRepository;

    @InjectMocks
    private MenuService menuService;

    private Categorie categorie;

    @BeforeEach
    void setUp() {
        categorie = new Categorie();
        categorie.setNom("Entrées");
        categorie.setSlug("entrees");
        categorie.setOrdreAffichage(0);
        categorie.setActive(true);
        ReflectionTestUtils.setField(categorie, "id", 1L);
    }

    @Test
    void listCategories_ShouldReturnMappedDtos() {
        when(categorieRepository.findAllByOrderByOrdreAffichageAscIdAsc()).thenReturn(List.of(categorie));

        List<CategorieDto> result = menuService.listCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).nom()).isEqualTo("Entrées");
        assertThat(result.get(0).slug()).isEqualTo("entrees");
        verify(categorieRepository).findAllByOrderByOrdreAffichageAscIdAsc();
    }

    @Test
    void deleteCategorie_ShouldThrow_WhenNotFound() {
        when(categorieRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> menuService.deleteCategorie(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("introuvable");
    }
}
