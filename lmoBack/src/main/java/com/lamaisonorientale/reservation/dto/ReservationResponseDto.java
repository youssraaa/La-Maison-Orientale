package com.lamaisonorientale.reservation.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationResponseDto(
        Long id,
        String message,
        LocalDate date,
        LocalTime heure,
        Integer nbPersonnes,
        String statut,
        Instant createdAt,
        String manageToken,
        String manageUrl
) {
}
