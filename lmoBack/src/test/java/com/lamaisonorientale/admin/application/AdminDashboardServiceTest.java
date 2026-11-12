package com.lamaisonorientale.admin.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lamaisonorientale.admin.dto.AdminDashboardDto;
import com.lamaisonorientale.commande.infrastructure.CommandeRepository;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private DemandeClientRepository demandeClientRepository;

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private RestaurantSettingsService restaurantSettingsService;

    @InjectMocks
    private AdminDashboardService adminDashboardService;

    @Test
    void getDashboard_ShouldReturnDashboardWithSevenDays() {
        when(reservationRepository.countByDateReservationAndStatutIn(any(LocalDate.class), any()))
                .thenReturn(2L);
        when(reservationRepository.sumActiveCoversForDate(any(LocalDate.class))).thenReturn(6);
        when(reservationRepository.countByDateReservationBetweenAndStatutIn(
                        any(LocalDate.class), any(LocalDate.class), any()))
                .thenReturn(5L);
        when(reservationRepository.countByStatut(StatutReservation.EN_ATTENTE)).thenReturn(1L);
        when(demandeClientRepository.countByStatut(any())).thenReturn(0L);
        when(demandeClientRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any()))
                .thenReturn(0L);
        when(reservationRepository.countByDateReservationBetween(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(10L);
        when(reservationRepository.countByDateReservationBetweenAndStatut(
                        any(LocalDate.class), any(LocalDate.class), eq(StatutReservation.CONFIRMEE)))
                .thenReturn(8L);
        when(reservationRepository.findByDateReservationAndStatutInOrderByHeureReservationAsc(any(), any()))
                .thenReturn(List.of());
        when(reservationRepository
                        .findByDateReservationBetweenAndStatutInOrderByDateReservationAscHeureReservationAsc(
                                any(), any(), any()))
                .thenReturn(List.of());
        when(demandeClientRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(restaurantSettingsService.getInt(eq("capacite_max_creneau"), eq(50))).thenReturn(50);
        when(reservationRepository.aggregateActiveByDate(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
        when(demandeClientRepository.countGroupedByDay(any(), any())).thenReturn(List.of());
        when(reservationRepository.countGroupedByStatut(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
        when(reservationRepository.countActiveGroupedByHour(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
        when(reservationRepository.countActiveGroupedByMonth(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
        when(reservationRepository.countActiveGroupedByPartySize(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
        when(reservationRepository.countActiveGroupedByServicePeriod(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
        when(commandeRepository.countActiveBetween(any(), any())).thenReturn(0L);
        when(commandeRepository.sumActiveTotalBetween(any(), any())).thenReturn(java.math.BigDecimal.ZERO);
        when(commandeRepository.aggregateActiveByDay(any(), any())).thenReturn(List.of());
        when(commandeRepository.countGroupedByStatut(any(), any())).thenReturn(List.of());

        AdminDashboardDto dashboard = adminDashboardService.getDashboard(7);

        assertThat(dashboard.days()).isEqualTo(7);
        assertThat(dashboard.kpis().reservationsToday()).isEqualTo(2L);
        assertThat(dashboard.kpis().coversToday()).isEqualTo(6L);
        assertThat(dashboard.kpis().confirmationRate()).isEqualTo(80);
        assertThat(dashboard.charts()).isNotNull();
    }
}
