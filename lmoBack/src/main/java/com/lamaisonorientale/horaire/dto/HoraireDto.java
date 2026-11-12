package com.lamaisonorientale.horaire.dto;

import java.time.LocalTime;

public record HoraireDto(
        Long id,
        short jourSemaine,
        String jourLabel,
        LocalTime heureOuverture,
        LocalTime heureFermeture,
        boolean actif) {}
