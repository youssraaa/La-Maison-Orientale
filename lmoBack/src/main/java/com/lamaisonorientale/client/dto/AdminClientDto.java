package com.lamaisonorientale.client.dto;

import java.time.Instant;

public record AdminClientDto(
        String nom,
        String email,
        String telephone,
        int nbReservations,
        int nbCommandes,
        int nbMessages,
        Instant datePremiereActivite,
        Instant derniereActivite,
        String adresseLivraison) {}
