package com.lamaisonorientale.demande.dto;

import java.time.Instant;

public record ContactResponseDto(
        Long id,
        String message,
        Instant createdAt
) {
}
