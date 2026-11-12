package com.lamaisonorientale.email;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("test")
public class EmailServiceTestImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceTestImpl.class);

    @Override
    public void sendContactNotificationToRestaurant(
            Long demandeId,
            String nom,
            String email,
            String telephone,
            String sujet,
            String message,
            Instant createdAt) {
        log.debug("Mock e-mail restaurant : demande #{} « {} » de {}", demandeId, sujet, nom);
    }

    @Override
    public void sendContactAcknowledgementToClient(
            String clientEmail, String nom, String sujet, String message) {
        log.debug("Mock e-mail client : accusé pour {} (sujet : {})", clientEmail, sujet);
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
        log.debug(
                "Mock e-mail réservation #{} : {} le {} à {} ({} pers.)",
                reservationId,
                nom,
                date,
                heure,
                nbPersonnes);
    }

    @Override
    public void sendReservationAcknowledgementToClient(
            String clientEmail,
            String nom,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes,
            String manageUrl) {
        log.debug("Mock accusé réservation pour {} : {} {} → {}", clientEmail, date, heure, manageUrl);
    }

    @Override
    public void sendReservationModificationToClient(
            String clientEmail,
            String nom,
            LocalDate date,
            LocalTime heure,
            Integer nbPersonnes,
            String manageUrl) {
        log.debug("Mock modification réservation client → {}", clientEmail);
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
        log.debug("Mock modification réservation restaurant #{} : {}", reservationId, nom);
    }

    @Override
    public void sendReservationCancellationToClient(
            String clientEmail, String nom, LocalDate date, LocalTime heure) {
        log.debug("Mock annulation réservation client → {}", clientEmail);
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
        log.debug("Mock annulation réservation restaurant #{} : {}", reservationId, nom);
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
        log.debug("Mock commande restaurant {} {}", reference, nom);
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
        log.debug("Mock confirmation commande {} → {}", reference, clientEmail);
    }

    @Override
    public void sendOrderCancellationToClient(String clientEmail, String nom, String reference) {
        log.debug("Mock annulation commande {} → {}", reference, clientEmail);
    }

    @Override
    public void sendOrderStatusToClient(String clientEmail, String nom, String reference, String mode, String statut) {
        log.debug("Mock statut commande {} ({}) → {}", reference, statut, clientEmail);
    }

    @Override
    public void sendAgentInviteEmail(String to, String nom, String activationLink) {
        log.debug("Mock invitation agent → {} : {}", to, activationLink);
    }

    @Override
    public void sendAgentPasswordResetEmail(String to, String nom, String resetLink) {
        log.debug("Mock reset mot de passe agent → {} : {}", to, resetLink);
    }

    @Override
    public void sendContactReplyToClient(
            String clientEmail, String nom, String sujetOriginal, String messageOriginal, String reponse) {
        log.debug("Mock réponse contact → {} : {}", clientEmail, reponse);
    }
}
