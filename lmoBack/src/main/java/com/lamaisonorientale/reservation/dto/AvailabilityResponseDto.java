package com.lamaisonorientale.reservation.dto;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponseDto(
        LocalDate date,
        boolean closed,
        int maxCoversPerSlot,
        List<SlotAvailabilityDto> slots
) {
    public record SlotAvailabilityDto(
            String time,
            boolean available,
            int remaining,
            String label
    ) {
    }
}
