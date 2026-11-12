package com.lamaisonorientale.demande.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateDemandeStatutRequest(
        @NotBlank(message = "Le statut est obligatoire") String statut) {}
