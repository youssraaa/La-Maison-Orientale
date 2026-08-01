package com.lamaisonorientale.email;

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
            Integer nbPersonnes) {
        log.debug("Mock accusé réservation pour {} : {} {}", clientEmail, date, heure);
    }
}
