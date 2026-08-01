package com.lamaisonorientale.admin.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AdminDashboardDto(
        LocalDate today,
        boolean closedToday,
        DashboardKpisDto kpis,
        List<ReservationRowDto> todayReservations,
        List<ReservationRowDto> upcomingReservations,
        List<MessageRowDto> recentMessages) {

    public record DashboardKpisDto(
            long reservationsToday,
            long coversToday,
            long reservationsWeek,
            long pendingReservations,
            long newMessages) {}

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
