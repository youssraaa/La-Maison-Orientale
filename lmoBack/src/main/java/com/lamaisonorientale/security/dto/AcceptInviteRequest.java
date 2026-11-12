package com.lamaisonorientale.security.dto;



import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.Size;



public record AcceptInviteRequest(

        @NotBlank(message = "Lien d'invitation invalide.") String token,

        @NotBlank(message = "Le mot de passe est obligatoire.")

                @Size(min = 8, max = 100, message = "Mot de passe : 8 caractères minimum.")

                String password) {}

