package com.lamaisonorientale.notification.dto;

import java.time.Instant;

public record NotificationDto(
        Long id,
        String type,
        String titre,
        String message,
        String lien,
        boolean lue,
        Instant createdAt) {}
