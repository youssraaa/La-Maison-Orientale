package com.lamaisonorientale.user.dto;

import java.time.Instant;

public record ClientMessageDto(
        Long id,
        String sujet,
        String message,
        String statut,
        Instant createdAt,
        Instant reponseAt,
        String reponse) {}
