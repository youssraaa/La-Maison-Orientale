package com.lamaisonorientale.email;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Fallback sans SMTP : log uniquement si {@code spring.mail.username} n'est pas configuré.
 */
@Service
@Profile("!test")
@ConditionalOnExpression("'${spring.mail.username:}'.trim().isEmpty()")
public class EmailServiceLocalImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceLocalImpl.class);

    @Override
    public void sendContactNotificationToRestaurant(
            Long demandeId,
            String nom,
            String email,
            String telephone,
            String sujet,
            String message,
            Instant createdAt) {
        log.info("[LOCAL MAIL] Contact restaurant #{} — {} ({})", demandeId, sujet, nom);
    }

    @Override
    public void sendContactAcknowledgementToClient(
            String clientEmail, String nom, String sujet, String message) {
        log.info("[LOCAL MAIL] Accusé contact → {}", clientEmail);
    }

    @Override
    public void sendReservationNotificationToRestaurant(
            Long reservationId,
            String nom,
            String email,
            String telephone,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes,
            String commentaire,
            Instant createdAt) {
        log.info("[LOCAL MAIL] Réservation #{} — {} le {}", reservationId, nom, date);
    }

    @Override
    public void sendReservationAcknowledgementToClient(
            String clientEmail,
            String nom,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes,
            String manageUrl) {
        log.info("[LOCAL MAIL] Accusé résa → {} | {}", clientEmail, manageUrl);
    }

    @Override
    public void sendReservationModificationToClient(
            String clientEmail,
            String nom,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes,
            String manageUrl) {
        log.info("[LOCAL MAIL] Modif résa client → {}", clientEmail);
    }

    @Override
    public void sendReservationModificationToRestaurant(
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
            String commentaire) {
        log.info("[LOCAL MAIL] Modif résa restaurant #{} — {} le {}", reservationId, nom, date);
    }

    @Override
    public void sendReservationCancellationToClient(
            String clientEmail, String nom, LocalDate date, LocalTime heure) {
        log.info("[LOCAL MAIL] Annulation résa client → {}", clientEmail);
    }

    @Override
    public void sendReservationCancellationToRestaurant(
            Long reservationId,
            String nom,
            String email,
            String telephone,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes) {
        log.info("[LOCAL MAIL] Annulation résa restaurant #{} — {}", reservationId, nom);
    }

    @Override
    public void sendOrderNotificationToRestaurant(
            Long commandeId,
            String reference,
            String nom,
            String email,
            String telephone,
            String mode,
            String modePaiement,
            BigDecimal total,
            String adresseLivraison,
            String commentaire,
            Instant createdAt) {
        log.info("[LOCAL MAIL] Commande {} — {}", reference, nom);
    }

    @Override
    public void sendOrderConfirmationToClient(
            String clientEmail,
            String nom,
            String reference,
            String mode,
            String modePaiement,
            BigDecimal total,
            String manageUrl) {
        log.info("[LOCAL MAIL] Confirmation commande {} → {}", reference, clientEmail);
    }

    @Override
    public void sendOrderCancellationToClient(String clientEmail, String nom, String reference) {
        log.info("[LOCAL MAIL] Annulation commande {} → {}", reference, clientEmail);
    }

    @Override
    public void sendOrderStatusToClient(String clientEmail, String nom, String reference, String mode, String statut) {
        log.info("[LOCAL MAIL] Statut commande {} ({}) → {}", reference, statut, clientEmail);
    }

    @Override
    public void sendAgentInviteEmail(String to, String nom, String activationLink) {
        log.info("[LOCAL MAIL] Invitation agent → {} | Lien : {}", to, activationLink);
    }

    @Override
    public void sendAgentPasswordResetEmail(String to, String nom, String resetLink) {
        log.info("[LOCAL MAIL] Reset mot de passe agent → {} | Lien : {}", to, resetLink);
    }

    @Override
    public void sendContactReplyToClient(
            String clientEmail, String nom, String sujetOriginal, String messageOriginal, String reponse) {
        log.info("[LOCAL MAIL] Réponse contact → {}", clientEmail);
    }
}
