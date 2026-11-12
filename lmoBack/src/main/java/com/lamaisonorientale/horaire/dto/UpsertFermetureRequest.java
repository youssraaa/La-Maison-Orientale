package com.lamaisonorientale.horaire.dto;

import java.time.LocalDate;

public record UpsertFermetureRequest(LocalDate dateFermeture, String motif) {}
