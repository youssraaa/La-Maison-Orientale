package com.lamaisonorientale.commande.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCommandeStatutRequest(@NotBlank @Size(max = 20) String statut) {}
