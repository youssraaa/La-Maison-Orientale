package com.lamaisonorientale.reservation.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateReservationStatutRequest(
        @NotBlank(message = "Le statut est obligatoire") String statut) {}
