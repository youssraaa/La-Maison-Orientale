package com.lamaisonorientale.user.dto;

import java.time.Instant;

public record StaffProfileDto(
        Long id,
        String nom,
        String email,
        String role,
        boolean actif,
        Instant createdAt) {}
