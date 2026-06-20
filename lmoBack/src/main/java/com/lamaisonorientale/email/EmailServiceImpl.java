package com.lamaisonorientale.email;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Profile("!test")
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter
            .ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.of("Europe/Brussels"));

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    @Value("${mail.restaurant-to}")
    private String restaurantTo;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendContactNotificationToRestaurant(
            Long demandeId,
            String nom,
            String email,
            String telephone,
            String message,
            Instant createdAt) {
        ensureConfigured();

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(from);
        mail.setTo(restaurantTo);
        mail.setSubject("[Contact] Nouvelle demande — " + nom);
        mail.setText("""
                Nouvelle demande de contact reçue sur le site La Maison Orientale.

                Référence : #%d
                Date : %s

                Nom : %s
                E-mail : %s
                Téléphone : %s

                Message :
                %s

                —
                Consultez aussi l'espace admin (à venir) ou la table demande_client.
                """.formatted(
                demandeId,
                DATE_FORMAT.format(createdAt),
                nom,
                displayOrDash(email),
                displayOrDash(telephone),
                message));

        send(mail, "Impossible d'envoyer la notification au restaurant.");
    }

    @Override
    public void sendContactAcknowledgementToClient(String clientEmail, String nom, String message) {
        if (!StringUtils.hasText(clientEmail)) {
            return;
        }
        ensureConfigured();

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(from);
        mail.setTo(clientEmail.trim());
        mail.setSubject("La Maison Orientale — nous avons bien reçu votre message");
        mail.setText("""
                Bonjour %s,

                Nous avons bien reçu votre message. L'équipe de La Maison Orientale vous répondra dans les meilleurs délais.

                Votre message :
                %s

                Cordialement,
                La Maison Orientale
                Quaregnon
                """.formatted(nom, message));

        try {
            mailSender.send(mail);
        } catch (MailException ex) {
            log.warn("Accusé de réception non envoyé au client {} : {}", clientEmail, ex.getMessage());
        }
    }

    private void send(SimpleMailMessage message, String errorDetail) {
        try {
            mailSender.send(message);
            log.info("E-mail envoyé : « {} » → {}", message.getSubject(), String.join(", ", message.getTo()));
        } catch (MailException ex) {
            log.error("Échec envoi e-mail : {}", ex.getMessage());
            throw new EmailDeliveryException(errorDetail, ex);
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
