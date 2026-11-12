package com.lamaisonorientale.reservation.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record AdminReservationDto(
        Long id,
        LocalDate date,
        LocalTime heure,
        Integer nbPersonnes,
        String nomClient,
        String emailClient,
        String telephoneClient,
        String commentaire,
        String statut,
        Instant createdAt) {}
