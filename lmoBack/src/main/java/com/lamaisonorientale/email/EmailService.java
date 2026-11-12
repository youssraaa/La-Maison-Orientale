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
            Integer nbPersonnes,
            String manageUrl);

    void sendReservationModificationToClient(
            String clientEmail,
            String nom,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes,
            String manageUrl);

    void sendReservationModificationToRestaurant(
            Long reservationId,
            String nom,
            String email,
            String telephone,
            LocalDate previousDate,
            LocalTime previousHeure,
            Integer previousNbPersonnes,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes,
            String commentaire);

    void sendReservationCancellationToClient(
            String clientEmail, String nom, LocalDate date, LocalTime heure);

    void sendReservationCancellationToRestaurant(
            Long reservationId,
            String nom,
            String email,
            String telephone,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes);

    void sendOrderNotificationToRestaurant(
            Long commandeId,
            String reference,
            String nom,
            String email,
            String telephone,
            String mode,
            String modePaiement,
            java.math.BigDecimal total,
            String adresseLivraison,
            String commentaire,
            Instant createdAt);

    void sendOrderConfirmationToClient(
            String clientEmail,
            String nom,
            String reference,
            String mode,
            String modePaiement,
            java.math.BigDecimal total,
            String manageUrl);

    void sendOrderCancellationToClient(String clientEmail, String nom, String reference);

    void sendOrderStatusToClient(
            String clientEmail, String nom, String reference, String mode, String statut);

    void sendAgentInviteEmail(String to, String nom, String activationLink);

    void sendAgentPasswordResetEmail(String to, String nom, String resetLink);

    void sendContactReplyToClient(
            String clientEmail, String nom, String sujetOriginal, String messageOriginal, String reponse);
}
