package com.lamaisonorientale.horaire.dto;

import java.time.LocalTime;

public record UpsertHoraireRequest(
        short jourSemaine, LocalTime heureOuverture, LocalTime heureFermeture, Boolean actif) {}
