package com.lamaisonorientale.reservation.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.horaire.application.HoraireService;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.dto.PublicReservationDetailDto;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository repository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private HoraireService horaireService;

    @Mock
    private RestaurantSettingsService settingsService;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private ReservationService reservationService;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(reservationService, "frontendUrl", "http://localhost:3000");
        reservation = new Reservation();
        reservation.setDateReservation(LocalDate.now().plusDays(5));
        reservation.setHeureReservation(LocalTime.of(19, 0));
        reservation.setNbPersonnes(2);
        reservation.setNomClient("Dupont");
        reservation.setEmailClient("client@test.local");
        reservation.setTelephoneClient("0498672262");
        reservation.setStatut(StatutReservation.CONFIRMEE);
        reservation.setGestionToken("token-resa");
        ReflectionTestUtils.setField(reservation, "id", 42L);
        ReflectionTestUtils.setField(reservation, "createdAt", Instant.now());
    }

    @Test
    void getByToken_ShouldReturnPublicDetail() {
        when(repository.findByGestionToken("token-resa")).thenReturn(Optional.of(reservation));
        when(settingsService.getInt(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyInt()))
                .thenReturn(2);

        PublicReservationDetailDto detail = reservationService.getByToken("token-resa");

        assertThat(detail.id()).isEqualTo(42L);
        assertThat(detail.nbPersonnes()).isEqualTo(2);
        assertThat(detail.statut()).isEqualTo("CONFIRMEE");
    }

    @Test
    void getByToken_ShouldThrow_WhenUnknownToken() {
        when(repository.findByGestionToken("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.getByToken("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("introuvable");
    }

    @Test
    void cancelByToken_ShouldMarkReservationAsCancelled() {
        when(repository.findByGestionToken("token-resa")).thenReturn(Optional.of(reservation));
        when(settingsService.getInt(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyInt()))
                .thenReturn(10);
        when(repository.save(any(Reservation.class))).thenAnswer(inv -> inv.getArgument(0));

        PublicReservationDetailDto cancelled = reservationService.cancelByToken("token-resa");

        assertThat(cancelled.statut()).isEqualTo("ANNULEE");
        verify(repository).save(any(Reservation.class));
    }
}
