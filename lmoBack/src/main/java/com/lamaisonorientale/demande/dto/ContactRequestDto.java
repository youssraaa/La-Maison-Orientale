package com.lamaisonorientale.demande.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequestDto(
        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
        String nom,

        @NotBlank(message = "L'e-mail est obligatoire pour que nous puissions vous répondre")
        @Email(message = "L'adresse e-mail n'est pas valide")
        @Size(max = 255)
        String email,

        @Size(max = 30, message = "Le téléphone ne peut pas dépasser 30 caractères")
        String telephone,

        @NotBlank(message = "Le sujet est obligatoire")
        @Size(max = 120, message = "Le sujet ne peut pas dépasser 120 caractères")
        String sujet,

        @NotBlank(message = "Le message est obligatoire")
        @Size(min = 10, max = 2000, message = "Le message doit contenir entre 10 et 2000 caractères")
        String message
) {
}
