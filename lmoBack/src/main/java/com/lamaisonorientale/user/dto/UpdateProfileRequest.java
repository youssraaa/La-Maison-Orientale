package com.lamaisonorientale.user.dto;

import com.lamaisonorientale.common.validation.ValidationMessages;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Le nom est obligatoire")
                @Size(max = 100, message = "Le nom est trop long")
                String nom,
        @NotBlank(message = ValidationMessages.EMAIL_REQUIRED)
                @Email(message = ValidationMessages.EMAIL_INVALID)
                @Size(max = 255, message = ValidationMessages.EMAIL_TOO_LONG)
                String email) {}
