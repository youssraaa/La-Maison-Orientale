package com.lamaisonorientale.demande.dto;

import java.time.Instant;

public record AdminMessageDto(
        Long id,
        String nom,
        String email,
        String telephone,
        String sujet,
        String message,
        String typeDemande,
        String statut,
        Instant createdAt,
        String reponseInterne,
        String reponseClient,
        Instant reponseAt) {}
