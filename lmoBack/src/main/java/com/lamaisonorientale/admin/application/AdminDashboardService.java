package com.lamaisonorientale.admin.application;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.admin.dto.AdminDashboardDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DailyPointDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DashboardChartsDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DashboardKpisDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.HourPointDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.MessageRowDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.ReservationRowDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.StatusPointDto;
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
    private static final DateTimeFormatter DAY_LABEL =
            DateTimeFormatter.ofPattern("EEE d MMM", Locale.FRENCH);

    private static final Map<String, String> STATUT_LABELS = Map.of(
            "EN_ATTENTE", "En attente",
            "CONFIRMEE", "Confirmée",
            "REFUSEE", "Refusée",
            "ANNULEE", "Annulée");

    private final ReservationRepository reservationRepository;
    private final DemandeClientRepository demandeClientRepository;

    public AdminDashboardService(
            ReservationRepository reservationRepository,
            DemandeClientRepository demandeClientRepository) {
        this.reservationRepository = reservationRepository;
        this.demandeClientRepository = demandeClientRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard(int requestedDays) {
        int days = requestedDays <= 7 ? 7 : 30;
        LocalDate today = LocalDate.now(BRUSSELS);
        LocalDate periodStart = today.minusDays(days - 1L);
        LocalDate weekEnd = today.plusDays(6);
        boolean closedToday = today.getDayOfWeek() == DayOfWeek.MONDAY;

        Instant periodFrom = periodStart.atStartOfDay(BRUSSELS).toInstant();
        Instant periodToExclusive = today.plusDays(1).atStartOfDay(BRUSSELS).toInstant();

        long reservationsToday =
                reservationRepository.countByDateReservationAndStatutIn(today, ACTIVE);
        Integer covers = reservationRepository.sumActiveCoversForDate(today);
        long coversToday = covers == null ? 0L : covers.longValue();
        long reservationsWeek =
                reservationRepository.countByDateReservationBetweenAndStatutIn(
                        today, weekEnd, ACTIVE);
        long pending = reservationRepository.countByStatut(StatutReservation.EN_ATTENTE);
        long newMessages = demandeClientRepository.countByStatut(StatutDemande.NOUVELLE);

        long reservationsPeriod =
                reservationRepository.countByDateReservationBetweenAndStatutIn(
                        periodStart, today, ACTIVE);
        long coversPeriod = sumCovers(periodStart, today);
        long messagesPeriod =
                demandeClientRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        periodFrom, periodToExclusive);

        long totalInPeriod =
                reservationRepository.countByDateReservationBetween(periodStart, today);
        long confirmedInPeriod =
                reservationRepository.countByDateReservationBetweenAndStatut(
                        periodStart, today, StatutReservation.CONFIRMEE);
        int confirmationRate =
                totalInPeriod == 0
                        ? 0
                        : (int) Math.round((confirmedInPeriod * 100.0) / totalInPeriod);

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

        DashboardChartsDto charts = buildCharts(periodStart, today, periodFrom, periodToExclusive);

        return new AdminDashboardDto(
                today,
                closedToday,
                days,
                new DashboardKpisDto(
                        reservationsToday,
                        coversToday,
                        reservationsWeek,
                        pending,
                        newMessages,
                        reservationsPeriod,
                        coversPeriod,
                        messagesPeriod,
                        confirmationRate),
                charts,
                todayRows,
                upcoming,
                messages);
    }

    private DashboardChartsDto buildCharts(
            LocalDate from, LocalDate to, Instant fromInstant, Instant toExclusive) {
        Map<LocalDate, long[]> byDay = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            byDay.put(d, new long[] {0L, 0L});
        }
        for (Object[] row : reservationRepository.aggregateActiveByDate(from, to)) {
            LocalDate date = toLocalDate(row[0]);
            if (date == null || !byDay.containsKey(date)) {
                continue;
            }
            byDay.put(date, new long[] {toLong(row[1]), toLong(row[2])});
        }

        List<DailyPointDto> reservationsByDay = new ArrayList<>();
        List<DailyPointDto> coversByDay = new ArrayList<>();
        for (Map.Entry<LocalDate, long[]> entry : byDay.entrySet()) {
            String date = entry.getKey().toString();
            String label = capitalize(entry.getKey().format(DAY_LABEL));
            reservationsByDay.add(new DailyPointDto(date, label, entry.getValue()[0]));
            coversByDay.add(new DailyPointDto(date, label, entry.getValue()[1]));
        }

        Map<LocalDate, Long> messagesMap = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            messagesMap.put(d, 0L);
        }
        for (Object[] row : demandeClientRepository.countGroupedByDay(fromInstant, toExclusive)) {
            LocalDate date = toLocalDate(row[0]);
            if (date != null && messagesMap.containsKey(date)) {
                messagesMap.put(date, toLong(row[1]));
            }
        }
        List<DailyPointDto> messagesByDay = new ArrayList<>();
        for (Map.Entry<LocalDate, Long> entry : messagesMap.entrySet()) {
            messagesByDay.add(
                    new DailyPointDto(
                            entry.getKey().toString(),
                            capitalize(entry.getKey().format(DAY_LABEL)),
                            entry.getValue()));
        }

        Map<String, Long> statusCounts = new HashMap<>();
        for (StatutReservation statut : StatutReservation.values()) {
            statusCounts.put(statut.name(), 0L);
        }
        for (Object[] row : reservationRepository.countGroupedByStatut(from, to)) {
            String statut = row[0] == null ? null : row[0].toString();
            if (statut != null) {
                statusCounts.put(statut, toLong(row[1]));
            }
        }
        List<StatusPointDto> byStatus = new ArrayList<>();
        for (StatutReservation statut : StatutReservation.values()) {
            byStatus.add(
                    new StatusPointDto(
                            statut.name(),
                            STATUT_LABELS.getOrDefault(statut.name(), statut.name()),
                            statusCounts.getOrDefault(statut.name(), 0L)));
        }

        Map<Integer, Long> hourCounts = new LinkedHashMap<>();
        for (int h = 12; h <= 22; h++) {
            hourCounts.put(h, 0L);
        }
        for (Object[] row : reservationRepository.countActiveGroupedByHour(from, to)) {
            int hour = (int) toLong(row[0]);
            if (hourCounts.containsKey(hour)) {
                hourCounts.put(hour, toLong(row[1]));
            } else if (hour >= 11 && hour <= 23) {
                hourCounts.put(hour, toLong(row[1]));
            }
        }
        List<HourPointDto> byHour = new ArrayList<>();
        hourCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(
                        e -> {
                            String label = String.format("%02d:00", e.getKey());
                            byHour.add(new HourPointDto(label, label, e.getValue()));
                        });

        return new DashboardChartsDto(
                reservationsByDay, coversByDay, messagesByDay, byStatus, byHour);
    }

    private long sumCovers(LocalDate from, LocalDate to) {
        long total = 0L;
        for (Object[] row : reservationRepository.aggregateActiveByDate(from, to)) {
            total += toLong(row[2]);
        }
        return total;
    }

    private static LocalDate toLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof java.sql.Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }

    private static long toLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    private static String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
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
