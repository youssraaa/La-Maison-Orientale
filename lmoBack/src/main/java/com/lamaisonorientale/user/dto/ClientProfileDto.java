package com.lamaisonorientale.user.dto;

import java.time.Instant;

public record ClientProfileDto(
        Long id,
        String nom,
        String prenom,
        String email,
        String telephone,
        String pays,
        String adresse,
        String ville,
        String codePostal,
        String adresseLivraison,
        String codePostalLivraison,
        String villeLivraison,
        Instant createdAt) {}
