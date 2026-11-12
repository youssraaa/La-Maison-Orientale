package com.lamaisonorientale.user.dto;

import java.time.Instant;

public record AgentResponseDto(
        Long id,
        String prenom,
        String nom,
        String email,
        String role,
        boolean actif,
        boolean invitationEnAttente,
        Instant createdAt) {}
