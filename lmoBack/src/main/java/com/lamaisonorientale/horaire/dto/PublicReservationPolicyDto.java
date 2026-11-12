package com.lamaisonorientale.horaire.dto;

public record PublicReservationPolicyDto(
        int maxOnlineCovers,
        int modificationDeadlineHours,
        int tableDurationMinutes,
        int tableDurationClientMinutes,
        int maxCoversPerSlot) {}
