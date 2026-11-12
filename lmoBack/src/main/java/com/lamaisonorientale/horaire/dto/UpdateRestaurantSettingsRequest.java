package com.lamaisonorientale.horaire.dto;



import java.math.BigDecimal;

public record UpdateRestaurantSettingsRequest(

        Integer capaciteMaxCreneau,

        Integer capaciteSalle,

        Integer capaciteTerrasse,

        Integer dureeCreneauMinutes,

        Integer dureeTableMinutes,

        Integer dureeTableClientMinutes,

        Integer delaiModificationHeures,

        Integer seuilAnnulationEnLignePersonnes,

        Integer horizonReservationJours,

        String heureOuvertureDefaut,

        String heureFermetureDefaut,

        String emailNotifRestaurant,

        BigDecimal fraisLivraison,

        BigDecimal montantMinimumLivraison) {}

