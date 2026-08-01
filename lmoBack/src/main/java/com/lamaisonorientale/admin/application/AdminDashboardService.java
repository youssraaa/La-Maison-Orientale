package com.lamaisonorientale.admin.application;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.admin.dto.AdminDashboardDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DashboardKpisDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.MessageRowDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.ReservationRowDto;
import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.domain.StatutDemande;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;

@Service
public class AdminDashboardService {

    private static final ZoneId BRUSSELS = ZoneId.of("Europe/Brussels");
    private static final Set<StatutReservation> ACTIVE =
            EnumSet.of(StatutReservation.EN_ATTENTE, StatutReservation.CONFIRMEE);

    private final ReservationRepository reservationRepository;
    private final DemandeClientRepository demandeClientRepository;

    public AdminDashboardService(
            ReservationRepository reservationRepository,
            DemandeClientRepository demandeClientRepository) {
        this.reservationRepository = reservationRepository;
        this.demandeClientRepository = demandeClientRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard() {
        LocalDate today = LocalDate.now(BRUSSELS);
        LocalDate weekEnd = today.plusDays(6);
        boolean closedToday = today.getDayOfWeek() == DayOfWeek.MONDAY;

        long reservationsToday =
                reservationRepository.countByDateReservationAndStatutIn(today, ACTIVE);
        Integer covers = reservationRepository.sumActiveCoversForDate(today);
        long coversToday = covers == null ? 0L : covers.longValue();
        long reservationsWeek =
                reservationRepository.countByDateReservationBetweenAndStatutIn(
                        today, weekEnd, ACTIVE);
        long pending =
                reservationRepository.countByStatut(StatutReservation.EN_ATTENTE);
        long newMessages = demandeClientRepository.countByStatut(StatutDemande.NOUVELLE);

        List<ReservationRowDto> todayRows =
                reservationRepository
                        .findByDateReservationAndStatutInOrderByHeureReservationAsc(today, ACTIVE)
                        .stream()
                        .map(this::toReservationRow)
                        .toList();

        List<ReservationRowDto> upcoming =
                reservationRepository
                        .findByDateReservationBetweenAndStatutInOrderByDateReservationAscHeureReservationAsc(
                                today.plusDays(1), weekEnd, ACTIVE)
                        .stream()
                        .limit(8)
                        .map(this::toReservationRow)
                        .toList();

        List<MessageRowDto> messages =
                demandeClientRepository.findTop5ByOrderByCreatedAtDesc().stream()
                        .map(this::toMessageRow)
                        .toList();

        return new AdminDashboardDto(
                today,
                closedToday,
                new DashboardKpisDto(
                        reservationsToday,
                        coversToday,
                        reservationsWeek,
                        pending,
                        newMessages),
                todayRows,
                upcoming,
                messages);
    }

    private ReservationRowDto toReservationRow(Reservation r) {
        return new ReservationRowDto(
                r.getId(),
                r.getDateReservation(),
                r.getHeureReservation(),
                r.getNbPersonnes(),
                r.getNomClient(),
                r.getTelephoneClient(),
                r.getEmailClient(),
                r.getCommentaire(),
                r.getStatut().name());
    }

    private MessageRowDto toMessageRow(DemandeClient d) {
        return new MessageRowDto(
                d.getId(),
                d.getNom(),
                d.getEmail(),
                d.getSujet(),
                d.getMessage(),
                d.getTypeDemande().name(),
                d.getStatut().name(),
                d.getCreatedAt());
    }
}
