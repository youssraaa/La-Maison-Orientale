package com.lamaisonorientale.reservation.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.dto.AdminReservationDto;
import com.lamaisonorientale.reservation.dto.UpdateReservationStatutRequest;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;

@ExtendWith(MockitoExtension.class)
class AdminReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private AdminReservationService adminReservationService;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        reservation = new Reservation();
        reservation.setDateReservation(LocalDate.of(2026, 9, 1));
        reservation.setHeureReservation(LocalTime.of(19, 30));
        reservation.setNbPersonnes(4);
        reservation.setNomClient("Dupont");
        reservation.setEmailClient("client@test.local");
        reservation.setTelephoneClient("0498672262");
        reservation.setCommentaire("Anniversaire");
        reservation.setStatut(StatutReservation.CONFIRMEE);
        ReflectionTestUtils.setField(reservation, "id", 1L);
        ReflectionTestUtils.setField(reservation, "createdAt", Instant.parse("2026-08-01T10:00:00Z"));
    }

    @Test
    void list_ShouldReturnAllReservations_WhenNoStatutFilter() {
        when(reservationRepository.findAllByOrderByDateReservationDescHeureReservationAsc())
                .thenReturn(List.of(reservation));

        List<AdminReservationDto> result = adminReservationService.list(null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).nomClient()).isEqualTo("Dupont");
        assertThat(result.get(0).statut()).isEqualTo("CONFIRMEE");
    }

    @Test
    void list_ShouldFilterByStatut() {
        Reservation cancelled = new Reservation();
        cancelled.setDateReservation(LocalDate.of(2026, 9, 2));
        cancelled.setHeureReservation(LocalTime.of(20, 0));
        cancelled.setNbPersonnes(2);
        cancelled.setNomClient("Martin");
        cancelled.setTelephoneClient("0498123456");
        cancelled.setStatut(StatutReservation.ANNULEE);
        ReflectionTestUtils.setField(cancelled, "id", 2L);
        ReflectionTestUtils.setField(cancelled, "createdAt", Instant.now());

        when(reservationRepository.findAllByOrderByDateReservationDescHeureReservationAsc())
                .thenReturn(List.of(reservation, cancelled));

        List<AdminReservationDto> result = adminReservationService.list("ANNULEE", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).statut()).isEqualTo("ANNULEE");
    }

    @Test
    void updateStatut_ShouldPersistNewStatut() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(inv -> inv.getArgument(0));

        AdminReservationDto updated =
                adminReservationService.updateStatut(1L, new UpdateReservationStatutRequest("ANNULEE"));

        assertThat(updated.statut()).isEqualTo("ANNULEE");
        verify(reservationRepository).save(reservation);
    }

    @Test
    void updateStatut_ShouldThrow_WhenReservationNotFound() {
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminReservationService.updateStatut(99L, new UpdateReservationStatutRequest("ANNULEE")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("introuvable");
    }
}
