package com.lamaisonorientale.horaire.dto;



import java.math.BigDecimal;

public record RestaurantSettingsDto(

        int capaciteMaxCreneau,

        int capaciteSalle,

        int capaciteTerrasse,

        int dureeCreneauMinutes,

        int dureeTableMinutes,

        int dureeTableClientMinutes,

        int delaiModificationHeures,

        int seuilAnnulationEnLignePersonnes,

        int horizonReservationJours,

        String heureOuvertureDefaut,

        String heureFermetureDefaut,

        String emailNotifRestaurant,

        BigDecimal fraisLivraison,

        BigDecimal montantMinimumLivraison) {}

