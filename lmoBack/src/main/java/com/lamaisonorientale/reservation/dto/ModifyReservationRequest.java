package com.lamaisonorientale.reservation.dto;



import java.time.LocalDate;

import java.time.LocalTime;



import jakarta.validation.constraints.Max;

import jakarta.validation.constraints.Min;

import jakarta.validation.constraints.NotNull;

import jakarta.validation.constraints.Size;



public record ModifyReservationRequest(

        @NotNull(message = "La date est obligatoire.") LocalDate date,

        @NotNull(message = "L'heure est obligatoire.") LocalTime heure,

        @NotNull(message = "Le nombre de personnes est obligatoire.")

                @Min(value = 1, message = "Au moins une personne est requise.")

                @Max(value = 30, message = "Pour plus de 30 personnes, contactez-nous directement.")

                Integer nbPersonnes,

        @Size(max = 2000, message = "Le commentaire ne peut pas dépasser 2000 caractères.")

                String commentaire) {}

