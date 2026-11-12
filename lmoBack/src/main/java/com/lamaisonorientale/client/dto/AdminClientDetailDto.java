package com.lamaisonorientale.client.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AdminClientDetailDto(
        String nom,
        String email,
        String telephone,
        List<ClientReservationItemDto> reservations,
        List<ClientCommandeItemDto> commandes,
        List<ClientMessageItemDto> messages) {

    public record ClientReservationItemDto(
            Long id,
            LocalDate dateReservation,
            LocalTime heureReservation,
            Integer nbPersonnes,
            String statut,
            Instant createdAt) {}

    public record ClientCommandeItemDto(
            Long id,
            String reference,
            String mode,
            String statut,
            BigDecimal total,
            Instant createdAt) {}

    public record ClientMessageItemDto(
            Long id, String sujet, String message, String statut, Instant createdAt) {}
}
