package com.lamaisonorientale.admin.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AdminDashboardDto(
        LocalDate today,
        boolean closedToday,
        int days,
        DashboardKpisDto kpis,
        DashboardChartsDto charts,
        List<ReservationRowDto> todayReservations,
        List<ReservationRowDto> upcomingReservations,
        List<MessageRowDto> recentMessages) {

    public record DashboardKpisDto(
            long reservationsToday,
            long coversToday,
            long reservationsWeek,
            long pendingReservations,
            long newMessages,
            long reservationsPeriod,
            long coversPeriod,
            long messagesPeriod,
            int confirmationRate,
            long reservationsYear,
            long coversYear,
            long commandesToday,
            double revenueToday,
            long commandesPeriod,
            double revenuePeriod) {}

    public record DashboardChartsDto(
            List<DailyPointDto> reservationsByDay,
            List<DailyPointDto> coversByDay,
            List<DailyPointDto> availableCoversByDay,
            List<DailyPointDto> messagesByDay,
            List<StatusPointDto> reservationsByStatus,
            List<HourPointDto> reservationsByHour,
            List<MonthlyPointDto> reservationsByMonth,
            List<CategoryPointDto> reservationsByPartySize,
            List<CategoryPointDto> reservationsByService,
            List<DailyPointDto> commandesByDay,
            List<MonthlyAmountPointDto> commandesByMonth,
            List<DailyAmountPointDto> revenueByDay,
            List<StatusPointDto> commandesByStatus) {}

    public record DailyPointDto(String date, String label, long value) {}

    public record DailyAmountPointDto(String date, String label, double amount) {}

    public record MonthlyPointDto(int month, String label, long value) {}

    public record MonthlyAmountPointDto(int month, String label, long count, double amount) {}

    public record CategoryPointDto(String key, String label, long value) {}

    public record StatusPointDto(String statut, String label, long value) {}

    public record HourPointDto(String heure, String label, long value) {}

    public record ReservationRowDto(
            Long id,
            LocalDate date,
            LocalTime heure,
            int nbPersonnes,
            String nomClient,
            String telephoneClient,
            String emailClient,
            String commentaire,
            String statut) {}

    public record MessageRowDto(
            Long id,
            String nom,
            String email,
            String sujet,
            String message,
            String typeDemande,
            String statut,
            Instant createdAt) {}
}
