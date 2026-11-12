package com.lamaisonorientale.admin.application;

import java.math.BigDecimal;
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
import com.lamaisonorientale.admin.dto.AdminDashboardDto.CategoryPointDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DailyPointDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DailyAmountPointDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DashboardChartsDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DashboardKpisDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.HourPointDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.MessageRowDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.MonthlyPointDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.MonthlyAmountPointDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.ReservationRowDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.StatusPointDto;
import com.lamaisonorientale.commande.domain.StatutCommande;
import com.lamaisonorientale.commande.infrastructure.CommandeRepository;
import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.domain.StatutDemande;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
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
    private static final DateTimeFormatter MONTH_LABEL =
            DateTimeFormatter.ofPattern("MMM", Locale.FRENCH);
    private static final int DEFAULT_SLOTS_PER_DAY = 11;

    private static final Map<String, String> STATUT_LABELS = Map.of(
            "EN_ATTENTE", "En attente",
            "CONFIRMEE", "Confirmée",
            "REFUSEE", "Refusée",
            "ANNULEE", "Annulée");

    private static final List<String> PARTY_SIZE_ORDER = List.of("1-2", "3-4", "5-6", "7+");

    private static final Map<String, String> PARTY_SIZE_LABELS = Map.of(
            "1-2", "1–2 personnes",
            "3-4", "3–4 personnes",
            "5-6", "5–6 personnes",
            "7+", "7+ personnes");

    private static final List<String> SERVICE_ORDER = List.of("MIDI", "SOIR");

    private static final Map<String, String> SERVICE_LABELS = Map.of(
            "MIDI", "Service midi",
            "SOIR", "Service soir");

    private static final Map<String, String> COMMANDE_STATUT_LABELS = Map.of(
            "EN_ATTENTE", "En attente",
            "CONFIRMEE", "Confirmée",
            "EN_PREPARATION", "En préparation",
            "PRETE", "Prête",
            "REMIS", "Remise",
            "LIVREE", "Livrée",
            "ANNULEE", "Annulée");

    private final ReservationRepository reservationRepository;
    private final DemandeClientRepository demandeClientRepository;
    private final CommandeRepository commandeRepository;
    private final RestaurantSettingsService restaurantSettingsService;

    public AdminDashboardService(
            ReservationRepository reservationRepository,
            DemandeClientRepository demandeClientRepository,
            CommandeRepository commandeRepository,
            RestaurantSettingsService restaurantSettingsService) {
        this.reservationRepository = reservationRepository;
        this.demandeClientRepository = demandeClientRepository;
        this.commandeRepository = commandeRepository;
        this.restaurantSettingsService = restaurantSettingsService;
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
        Instant todayFrom = today.atStartOfDay(BRUSSELS).toInstant();
        Instant tomorrowFrom = today.plusDays(1).atStartOfDay(BRUSSELS).toInstant();

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

        LocalDate yearStart = LocalDate.of(today.getYear(), 1, 1);
        LocalDate yearEnd = LocalDate.of(today.getYear(), 12, 31);
        long reservationsYear =
                reservationRepository.countByDateReservationBetweenAndStatutIn(
                        yearStart, yearEnd, ACTIVE);
        long coversYear = sumCovers(yearStart, yearEnd);

        long commandesToday = commandeRepository.countActiveBetween(todayFrom, tomorrowFrom);
        double revenueToday = toDouble(commandeRepository.sumActiveTotalBetween(todayFrom, tomorrowFrom));
        long commandesPeriod = commandeRepository.countActiveBetween(periodFrom, periodToExclusive);
        double revenuePeriod =
                toDouble(commandeRepository.sumActiveTotalBetween(periodFrom, periodToExclusive));

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

        DashboardChartsDto charts =
                buildCharts(periodStart, today, periodFrom, periodToExclusive);

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
                        confirmationRate,
                        reservationsYear,
                        coversYear,
                        commandesToday,
                        revenueToday,
                        commandesPeriod,
                        revenuePeriod),
                charts,
                todayRows,
                upcoming,
                messages);
    }

    private DashboardChartsDto buildCharts(
            LocalDate from,
            LocalDate to,
            Instant fromInstant,
            Instant toExclusive) {
        int maxCoversPerSlot = restaurantSettingsService.getInt("capacite_max_creneau", 50);
        long dailyCapacity = (long) maxCoversPerSlot * DEFAULT_SLOTS_PER_DAY;

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
        List<DailyPointDto> availableCoversByDay = new ArrayList<>();
        for (Map.Entry<LocalDate, long[]> entry : byDay.entrySet()) {
            String date = entry.getKey().toString();
            String label = capitalize(entry.getKey().format(DAY_LABEL));
            long covers = entry.getValue()[1];
            boolean closedDay = entry.getKey().getDayOfWeek() == DayOfWeek.MONDAY;
            long available =
                    closedDay ? 0L : Math.max(0L, dailyCapacity - covers);
            reservationsByDay.add(new DailyPointDto(date, label, entry.getValue()[0]));
            coversByDay.add(new DailyPointDto(date, label, covers));
            availableCoversByDay.add(new DailyPointDto(date, label, available));
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

        LocalDate yearStart = LocalDate.of(from.getYear(), 1, 1);
        LocalDate yearEnd = LocalDate.of(from.getYear(), 12, 31);
        Map<Integer, Long> monthCounts = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) {
            monthCounts.put(m, 0L);
        }
        for (Object[] row : reservationRepository.countActiveGroupedByMonth(yearStart, yearEnd)) {
            int month = (int) toLong(row[0]);
            if (monthCounts.containsKey(month)) {
                monthCounts.put(month, toLong(row[1]));
            }
        }
        List<MonthlyPointDto> byMonth = new ArrayList<>();
        for (Map.Entry<Integer, Long> entry : monthCounts.entrySet()) {
            String label =
                    capitalize(
                            LocalDate.of(from.getYear(), entry.getKey(), 1)
                                    .format(MONTH_LABEL));
            byMonth.add(new MonthlyPointDto(entry.getKey(), label, entry.getValue()));
        }

        Map<String, Long> partyCounts = new LinkedHashMap<>();
        for (String key : PARTY_SIZE_ORDER) {
            partyCounts.put(key, 0L);
        }
        for (Object[] row : reservationRepository.countActiveGroupedByPartySize(from, to)) {
            String bucket = row[0] == null ? null : row[0].toString();
            if (bucket != null && partyCounts.containsKey(bucket)) {
                partyCounts.put(bucket, toLong(row[1]));
            }
        }
        List<CategoryPointDto> byPartySize = new ArrayList<>();
        for (String key : PARTY_SIZE_ORDER) {
            byPartySize.add(
                    new CategoryPointDto(
                            key,
                            PARTY_SIZE_LABELS.get(key),
                            partyCounts.getOrDefault(key, 0L)));
        }

        Map<String, Long> serviceCounts = new LinkedHashMap<>();
        for (String key : SERVICE_ORDER) {
            serviceCounts.put(key, 0L);
        }
        for (Object[] row : reservationRepository.countActiveGroupedByServicePeriod(from, to)) {
            String service = row[0] == null ? null : row[0].toString();
            if (service != null && serviceCounts.containsKey(service)) {
                serviceCounts.put(service, toLong(row[1]));
            }
        }
        List<CategoryPointDto> byService = new ArrayList<>();
        for (String key : SERVICE_ORDER) {
            byService.add(
                    new CategoryPointDto(
                            key,
                            SERVICE_LABELS.get(key),
                            serviceCounts.getOrDefault(key, 0L)));
        }

        Map<LocalDate, Long> commandeCountMap = new LinkedHashMap<>();
        Map<LocalDate, Double> commandeRevenueMap = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            commandeCountMap.put(d, 0L);
            commandeRevenueMap.put(d, 0.0);
        }
        for (Object[] row : commandeRepository.aggregateActiveByDay(fromInstant, toExclusive)) {
            LocalDate date = toLocalDate(row[0]);
            if (date == null || !commandeCountMap.containsKey(date)) {
                continue;
            }
            commandeCountMap.put(date, toLong(row[1]));
            commandeRevenueMap.put(date, toDouble(row[2]));
        }
        List<DailyPointDto> commandesByDay = new ArrayList<>();
        List<DailyAmountPointDto> revenueByDay = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            String date = d.toString();
            String label = capitalize(d.format(DAY_LABEL));
            commandesByDay.add(new DailyPointDto(date, label, commandeCountMap.get(d)));
            revenueByDay.add(new DailyAmountPointDto(date, label, commandeRevenueMap.get(d)));
        }

        Map<Integer, long[]> commandeMonthMap = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) {
            commandeMonthMap.put(m, new long[] {0L, 0L});
        }
        for (Object[] row : commandeRepository.aggregateActiveByMonth(fromInstant, toExclusive)) {
            int month = (int) toLong(row[0]);
            if (commandeMonthMap.containsKey(month)) {
                long[] cur = commandeMonthMap.get(month);
                cur[0] += toLong(row[1]);
                cur[1] += toLong(row[2]);
            }
        }
        List<MonthlyAmountPointDto> commandesByMonth = new ArrayList<>();
        for (Map.Entry<Integer, long[]> entry : commandeMonthMap.entrySet()) {
            String label = capitalize(
                    LocalDate.of(from.getYear(), entry.getKey(), 1)
                            .format(MONTH_LABEL));
            commandesByMonth.add(new MonthlyAmountPointDto(
                    entry.getKey(), label, entry.getValue()[0], (double) entry.getValue()[1]));
        }

        Map<String, Long> commandeStatusCounts = new HashMap<>();
        for (StatutCommande statut : StatutCommande.values()) {
            commandeStatusCounts.put(statut.name(), 0L);
        }
        for (Object[] row : commandeRepository.countGroupedByStatut(fromInstant, toExclusive)) {
            String statut = row[0] == null ? null : row[0].toString();
            if (statut != null) {
                commandeStatusCounts.put(statut, toLong(row[1]));
            }
        }
        List<StatusPointDto> commandesByStatus = new ArrayList<>();
        for (StatutCommande statut : StatutCommande.values()) {
            commandesByStatus.add(
                    new StatusPointDto(
                            statut.name(),
                            COMMANDE_STATUT_LABELS.getOrDefault(statut.name(), statut.name()),
                            commandeStatusCounts.getOrDefault(statut.name(), 0L)));
        }

        return new DashboardChartsDto(
                reservationsByDay,
                coversByDay,
                availableCoversByDay,
                messagesByDay,
                byStatus,
                byHour,
                byMonth,
                byPartySize,
                byService,
                commandesByDay,
                commandesByMonth,
                revenueByDay,
                commandesByStatus);
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

    private static double toDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal.doubleValue();
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.parseDouble(value.toString());
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
