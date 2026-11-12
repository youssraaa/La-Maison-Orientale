package com.lamaisonorientale.user.dto;

import com.lamaisonorientale.common.validation.ValidationMessages;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClientSignUpRequest(
        @NotBlank @Size(max = 100) String nom,
        @NotBlank(message = ValidationMessages.EMAIL_REQUIRED)
                @Email(message = ValidationMessages.EMAIL_INVALID)
                @Size(max = 255, message = ValidationMessages.EMAIL_TOO_LONG)
                String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Pattern(regexp = ValidationMessages.PHONE_PATTERN, message = ValidationMessages.PHONE_INVALID)
                @Size(max = 30, message = ValidationMessages.PHONE_TOO_LONG)
                String telephone) {}
