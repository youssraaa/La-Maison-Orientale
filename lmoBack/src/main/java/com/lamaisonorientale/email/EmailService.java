package com.lamaisonorientale.email;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public interface EmailService {

    void sendContactNotificationToRestaurant(
            Long demandeId,
            String nom,
            String email,
            String telephone,
            String sujet,
            String message,
            Instant createdAt);

    void sendContactAcknowledgementToClient(
            String clientEmail, String nom, String sujet, String message);

    void sendReservationNotificationToRestaurant(
            Long reservationId,
            String nom,
            String email,
            String telephone,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes,
            String commentaire,
            Instant createdAt);

    void sendReservationAcknowledgementToClient(
            String clientEmail,
            String nom,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes);
}
