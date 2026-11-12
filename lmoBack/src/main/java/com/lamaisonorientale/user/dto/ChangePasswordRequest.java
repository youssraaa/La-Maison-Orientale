package com.lamaisonorientale.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Le mot de passe actuel est obligatoire") String currentPassword,
        @NotBlank(message = "Le nouveau mot de passe est obligatoire")
                @Size(min = 8, max = 100, message = "Mot de passe : 8 caractères minimum")
                String newPassword) {}
