package com.lamaisonorientale.user.dto;

import com.lamaisonorientale.common.validation.ValidationMessages;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClientUpdateProfileRequest(
        @NotBlank @Size(max = 100) String nom,
        @NotBlank @Size(max = 100) String prenom,
        @NotBlank(message = ValidationMessages.EMAIL_REQUIRED)
                @Email(message = ValidationMessages.EMAIL_INVALID)
                @Size(max = 255, message = ValidationMessages.EMAIL_TOO_LONG)
                String email,
        @Size(max = 30, message = ValidationMessages.PHONE_TOO_LONG)
                String telephone,
        @Size(max = 100) String pays,
        @Size(max = 255) String adresse,
        @Size(max = 100) String ville,
        @Size(max = 20) String codePostal,
        @Size(max = 100) String adresseLivraison,
        @Size(max = 20) String codePostalLivraison,
        @Size(max = 100) String villeLivraison) {}
