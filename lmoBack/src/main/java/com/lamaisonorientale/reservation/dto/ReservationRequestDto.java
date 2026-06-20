package com.lamaisonorientale.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReservationRequestDto(
        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
        String nom,

        @NotBlank(message = "Le téléphone est obligatoire")
        @Size(max = 30, message = "Le téléphone ne peut pas dépasser 30 caractères")
        String telephone,

        @Email(message = "L'adresse e-mail n'est pas valide")
        @Size(max = 255)
        String email,

        @NotNull(message = "La date est obligatoire")
        @Future(message = "La date doit être dans le futur")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,

        @NotNull(message = "L'heure est obligatoire")
        @JsonFormat(pattern = "HH:mm")
        LocalTime heure,

        @NotNull(message = "Le nombre de personnes est obligatoire")
        @Min(value = 1, message = "Au moins une personne est requise")
        @Max(value = 30, message = "Pour plus de 30 personnes, contactez-nous directement")
        Integer nbPersonnes,

        @Size(max = 2000, message = "Le commentaire ne peut pas dépasser 2000 caractères")
        String commentaire
) {
}
