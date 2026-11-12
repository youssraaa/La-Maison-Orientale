package com.lamaisonorientale.horaire.dto;

import java.util.List;

public record PublicHoursDto(List<DaySchedule> schedule, String summary) {

    public record DaySchedule(String day, String time) {}
}
