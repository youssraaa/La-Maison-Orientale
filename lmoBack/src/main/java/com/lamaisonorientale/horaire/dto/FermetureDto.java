package com.lamaisonorientale.horaire.dto;

import java.time.LocalDate;

public record FermetureDto(Long id, LocalDate dateFermeture, String motif) {}
