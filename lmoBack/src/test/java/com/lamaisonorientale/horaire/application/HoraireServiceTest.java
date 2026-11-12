package com.lamaisonorientale.horaire.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.horaire.domain.HoraireOuverture;
import com.lamaisonorientale.horaire.dto.HoraireDto;
import com.lamaisonorientale.horaire.dto.PublicHoursDto;
import com.lamaisonorientale.horaire.infrastructure.FermetureExceptionnelleRepository;
import com.lamaisonorientale.horaire.infrastructure.HoraireOuvertureRepository;

@ExtendWith(MockitoExtension.class)
class HoraireServiceTest {

    @Mock
    private HoraireOuvertureRepository horaireRepository;

    @Mock
    private FermetureExceptionnelleRepository fermetureRepository;

    @InjectMocks
    private HoraireService horaireService;

    private HoraireOuverture horaire;

    @BeforeEach
    void setUp() {
        horaire = new HoraireOuverture();
        horaire.setJourSemaine((short) 2);
        horaire.setHeureOuverture(LocalTime.of(12, 0));
        horaire.setHeureFermeture(LocalTime.of(22, 30));
        horaire.setActif(true);
        ReflectionTestUtils.setField(horaire, "id", 1L);
    }

    @Test
    void listHoraires_ShouldReturnMappedDtos() {
        when(horaireRepository.findAllByOrderByJourSemaineAsc()).thenReturn(List.of(horaire));

        List<HoraireDto> result = horaireService.listHoraires();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).jourLabel()).isEqualTo("Mardi");
        assertThat(result.get(0).heureOuverture()).isEqualTo(LocalTime.of(12, 0));
        verify(horaireRepository).findAllByOrderByJourSemaineAsc();
    }

    @Test
    void getPublicHours_ShouldReturnScheduleAndSummary() {
        when(horaireRepository.findAllByOrderByJourSemaineAsc()).thenReturn(List.of(horaire));

        PublicHoursDto hours = horaireService.getPublicHours();

        assertThat(hours.schedule()).hasSize(1);
        assertThat(hours.schedule().get(0).day()).isEqualTo("Mardi");
        assertThat(hours.schedule().get(0).time()).contains("12:00");
        assertThat(hours.summary()).isNotBlank();
    }
}
