package com.lamaisonorientale.email;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@Profile("!test")
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter
            .ofPattern("dd/MM/yyyy 'à' HH:mm")
            .withZone(ZoneId.of("Europe/Brussels"));

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    @Value("${mail.restaurant-to}")
    private String restaurantTo;

    @Value("${mail.restaurant-phone:0498 67 22 62}")
    private String restaurantPhone;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendContactNotificationToRestaurant(
            Long demandeId,
            String nom,
            String email,
            String telephone,
            String sujet,
            String message,
            Instant createdAt) {
        ensureConfigured();

        String dateLabel = DATE_FORMAT.format(createdAt);
        String replyHint =
                "Pour répondre au client : cliquez sur « Répondre ».\nLe message partira à : " + email.trim();

        String body = """
                Nouvelle demande de contact — La Maison Orientale

                Référence : #%d
                Date : %s

                Nom : %s
                E-mail : %s

                Sujet : %s

                Message :
                %s

                —
                %s
                """.formatted(
                demandeId,
                dateLabel,
                nom,
                email.trim(),
                sujet,
                message,
                replyHint);

        sendPlain(
                restaurantTo,
                "[Contact] " + sujet + " — " + nom,
                body,
                email.trim(),
                "Impossible d'envoyer la notification au restaurant.");
    }

    @Override
    public void sendContactAcknowledgementToClient(
            String clientEmail, String nom, String sujet, String message) {
        if (!StringUtils.hasText(clientEmail)) {
            return;
        }
        ensureConfigured();

        String body = """
                Bonjour %s,

                Merci pour votre message. Nous l’avons bien reçu.
                L’équipe de La Maison Orientale vous répondra dans les meilleurs délais.

                Sujet : %s

                Votre message :
                %s

                Une question urgente ? Appelez-nous au %s

                Cordialement,
                La Maison Orientale
                Rue Jules Destrée 219, 7390 Quaregnon
                """.formatted(nom, sujet, message, restaurantPhone);

        try {
            sendPlain(
                    clientEmail.trim(),
                    "La Maison Orientale — nous avons bien reçu votre message",
                    body,
                    restaurantTo,
                    null);
        } catch (EmailDeliveryException ex) {
            log.warn("Accusé de réception non envoyé au client {} : {}", clientEmail, ex.getMessage());
        }
    }

    @Override
    public void sendReservationNotificationToRestaurant(
            Long reservationId,
            String nom,
            String email,
            String telephone,
            java.time.LocalDate date,
            java.time.LocalTime heure,
            Integer nbPersonnes,
            String commentaire,
            Instant createdAt) {
        ensureConfigured();

        String body = """
                Nouvelle demande de réservation — La Maison Orientale

                Référence : #%d
                Date demande : %s

                Nom : %s
                Téléphone : %s
                E-mail : %s

                Date souhaitée : %s
                Heure : %s
                Couverts : %d

                Commentaire :
                %s

                —
                Réservation CONFIRMÉE automatiquement (créneau disponible au moment de la demande).
                """.formatted(
                reservationId,
                DATE_FORMAT.format(createdAt),
                nom,
                telephone,
                displayOrDash(email),
                date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                heure,
                nbPersonnes,
                StringUtils.hasText(commentaire) ? commentaire.trim() : "—");

        try {
            sendPlain(
                    restaurantTo,
                    "[Réservation confirmée] " + date + " " + heure + " — " + nom + " (" + nbPersonnes + " pers.)",
                    body,
                    StringUtils.hasText(email) ? email.trim() : null,
                    "Impossible d'envoyer la notification de réservation au restaurant.");
        } catch (EmailDeliveryException ex) {
            log.warn(
                    "Notification restaurant non envoyée pour réservation #{} : {}",
                    reservationId,
                    ex.getMessage());
        }
    }

    @Override
    public void sendReservationAcknowledgementToClient(
            String clientEmail,
            String nom,
            java.time.LocalDate date,
            java.time.LocalTime heure,
            Integer nbPersonnes) {
        if (!StringUtils.hasText(clientEmail)) {
            return;
        }
        ensureConfigured();

        String body = """
                Bonjour %s,

                Nous avons bien reçu votre réservation. Votre table est confirmée.

                Date : %s
                Heure : %s
                Couverts : %d

                La table est conservée jusqu’à 15 minutes après l’heure prévue.

                Une question ? Appelez-nous au %s

                À bientôt,
                La Maison Orientale
                Rue Jules Destrée 219, 7390 Quaregnon
                """.formatted(
                nom,
                date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                heure,
                nbPersonnes,
                restaurantPhone);

        try {
            sendPlain(
                    clientEmail.trim(),
                    "La Maison Orientale — votre table est réservée",
                    body,
                    restaurantTo,
                    null);
        } catch (EmailDeliveryException ex) {
            log.warn("Accusé réservation non envoyé au client {} : {}", clientEmail, ex.getMessage());
        }
    }

    private void sendPlain(
            String to,
            String subject,
            String text,
            String replyTo,
            String errorDetail) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            if (StringUtils.hasText(replyTo)) {
                helper.setReplyTo(replyTo.trim());
            }
            helper.setText(text, false);
            mailSender.send(mime);
            log.info("E-mail envoyé : « {} » → {}", subject, to);
        } catch (MessagingException | MailException ex) {
            log.error("Échec envoi e-mail : {}", ex.getMessage());
            if (errorDetail != null) {
                throw new EmailDeliveryException(errorDetail, ex);
            }
            throw new EmailDeliveryException("Impossible d'envoyer l'e-mail.", ex);
        }
    }

    private void ensureConfigured() {
        if (!StringUtils.hasText(from) || !StringUtils.hasText(restaurantTo)) {
            throw new EmailDeliveryException(
                    "Configuration mail incomplète : définissez MAIL_FROM et MAIL_RESTAURANT_TO dans .env");
        }
    }

    private static String displayOrDash(String value) {
        return StringUtils.hasText(value) ? value.trim() : "—";
    }
}
