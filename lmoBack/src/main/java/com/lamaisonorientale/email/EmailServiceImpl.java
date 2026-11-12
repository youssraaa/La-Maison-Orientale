package com.lamaisonorientale.email;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
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
@ConditionalOnExpression("!'${spring.mail.username:}'.trim().isEmpty()")
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
            Integer nbPersonnes,
            String manageUrl) {
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

                Modifier ou annuler votre réservation (lien valable à tout moment) :
                %s

                Conservez cet e-mail : vous pourrez changer la date, l'heure ou annuler sans vous reconnecter.

                Une question ? Appelez-nous au %s

                À bientôt,
                La Maison Orientale
                Rue Jules Destrée 219, 7390 Quaregnon
                """.formatted(
                nom,
                date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                heure,
                nbPersonnes,
                manageUrl,
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

    @Override
    public void sendReservationModificationToClient(
            String clientEmail,
            String nom,
            java.time.LocalDate date,
            java.time.LocalTime heure,
            Integer nbPersonnes,
            String manageUrl) {
        if (!StringUtils.hasText(clientEmail)) {
            return;
        }
        ensureConfigured();
        String body = """
                Bonjour %s,

                Votre réservation a bien été modifiée.

                Nouvelle date : %s
                Nouvelle heure : %s
                Couverts : %d

                Gérer votre réservation :
                %s

                La Maison Orientale
                """.formatted(
                nom,
                date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                heure,
                nbPersonnes,
                manageUrl);
        sendPlain(clientEmail.trim(), "La Maison Orientale — réservation modifiée", body, restaurantTo, null);
    }

    @Override
    public void sendReservationModificationToRestaurant(
            Long reservationId,
            String nom,
            String email,
            String telephone,
            java.time.LocalDate previousDate,
            java.time.LocalTime previousHeure,
            Integer previousNbPersonnes,
            java.time.LocalDate date,
            java.time.LocalTime heure,
            Integer nbPersonnes,
            String commentaire) {
        ensureConfigured();

        String body = """
                Modification de réservation — La Maison Orientale

                Référence : #%d

                Client : %s
                Téléphone : %s
                E-mail : %s

                Avant :
                Date : %s
                Heure : %s
                Couverts : %d

                Après :
                Date : %s
                Heure : %s
                Couverts : %d

                Commentaire :
                %s
                """.formatted(
                reservationId,
                nom,
                telephone,
                displayOrDash(email),
                previousDate.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                previousHeure,
                previousNbPersonnes,
                date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                heure,
                nbPersonnes,
                StringUtils.hasText(commentaire) ? commentaire.trim() : "—");

        try {
            sendPlain(
                    restaurantTo,
                    "[Réservation modifiée] " + date + " " + heure + " — " + nom + " (" + nbPersonnes + " pers.)",
                    body,
                    StringUtils.hasText(email) ? email.trim() : null,
                    "Impossible d'envoyer la notification de modification au restaurant.");
        } catch (EmailDeliveryException ex) {
            log.warn(
                    "Notification modification restaurant non envoyée pour réservation #{} : {}",
                    reservationId,
                    ex.getMessage());
        }
    }

    @Override
    public void sendReservationCancellationToClient(
            String clientEmail, String nom, java.time.LocalDate date, java.time.LocalTime heure) {
        if (!StringUtils.hasText(clientEmail)) {
            return;
        }
        ensureConfigured();
        String body = """
                Bonjour %s,

                Votre réservation du %s à %s a bien été annulée.

                À bientôt,
                La Maison Orientale
                """.formatted(
                nom,
                date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                heure);
        sendPlain(clientEmail.trim(), "La Maison Orientale — réservation annulée", body, restaurantTo, null);
    }

    @Override
    public void sendReservationCancellationToRestaurant(
            Long reservationId,
            String nom,
            String email,
            String telephone,
            java.time.LocalDate date,
            java.time.LocalTime heure,
            Integer nbPersonnes) {
        ensureConfigured();

        String body = """
                Annulation de réservation — La Maison Orientale

                Référence : #%d

                Client : %s
                Téléphone : %s
                E-mail : %s

                Réservation annulée :
                Date : %s
                Heure : %s
                Couverts : %d
                """.formatted(
                reservationId,
                nom,
                telephone,
                displayOrDash(email),
                date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                heure,
                nbPersonnes);

        try {
            sendPlain(
                    restaurantTo,
                    "[Réservation annulée] " + date + " " + heure + " — " + nom,
                    body,
                    StringUtils.hasText(email) ? email.trim() : null,
                    "Impossible d'envoyer la notification d'annulation au restaurant.");
        } catch (EmailDeliveryException ex) {
            log.warn(
                    "Notification annulation restaurant non envoyée pour réservation #{} : {}",
                    reservationId,
                    ex.getMessage());
        }
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
            java.math.BigDecimal total,
            String adresseLivraison,
            String commentaire,
            Instant createdAt) {
        ensureConfigured();
        String body = """
                Nouvelle commande — La Maison Orientale

                Référence : %s (#%d)
                Date : %s

                Client : %s
                Téléphone : %s
                E-mail : %s
                Mode : %s
                Paiement : %s
                Total : %s €
                Adresse : %s

                Commentaire :
                %s
                """.formatted(
                reference,
                commandeId,
                DATE_FORMAT.format(createdAt),
                nom,
                telephone,
                displayOrDash(email),
                mode,
                displayOrDash(modePaiement),
                total,
                StringUtils.hasText(adresseLivraison) ? adresseLivraison.trim() : "—",
                StringUtils.hasText(commentaire) ? commentaire.trim() : "—");
        sendPlain(
                restaurantTo,
                "[Commande] " + reference + " — " + nom,
                body,
                StringUtils.hasText(email) ? email.trim() : null,
                "Impossible d'envoyer la notification de commande au restaurant.");
    }

    @Override
    public void sendOrderConfirmationToClient(
            String clientEmail,
            String nom,
            String reference,
            String mode,
            String modePaiement,
            java.math.BigDecimal total,
            String manageUrl) {
        if (!StringUtils.hasText(clientEmail)) {
            return;
        }
        ensureConfigured();
        String estimate = "LIVRAISON".equalsIgnoreCase(mode)
            ? "Livraison estimée sous 25 à 45 minutes."
            : "Commande prête à emporter sous environ 15 minutes.";
        String body = """
                Bonjour %s,

                Merci pour votre commande %s.

                Mode : %s
                Paiement : %s
                Total : %s €

                Délai indicatif : %s

                Suivre ou annuler votre commande :
                %s

                La Maison Orientale
                Tél. %s
                """.formatted(nom, reference, mode, modePaiement, total, estimate, manageUrl, restaurantPhone);
        try {
            sendPlain(
                    clientEmail.trim(),
                    "La Maison Orientale — commande confirmée",
                    body,
                    restaurantTo,
                    null);
        } catch (EmailDeliveryException ex) {
            log.warn("Confirmation commande non envoyée au client {} : {}", clientEmail, ex.getMessage());
        }
    }

    @Override
    public void sendOrderCancellationToClient(String clientEmail, String nom, String reference) {
        if (!StringUtils.hasText(clientEmail)) {
            return;
        }
        ensureConfigured();
        String body = """
                Bonjour %s,

                Votre commande %s a bien été annulée.

                La Maison Orientale
                """.formatted(nom, reference);
        sendPlain(clientEmail.trim(), "La Maison Orientale — commande annulée", body, restaurantTo, null);
    }

    @Override
    public void sendOrderStatusToClient(
            String clientEmail, String nom, String reference, String mode, String statut) {
        if (!StringUtils.hasText(clientEmail)) return;
        ensureConfigured();
        boolean delivery = "LIVRAISON".equalsIgnoreCase(mode);
        String title;
        String statusMessage;
        switch (statut) {
            case "EN_PREPARATION" -> { title = "Commande en préparation"; statusMessage = "Votre commande est en cours de préparation."; }
            case "PRETE" -> { title = "Commande prête"; statusMessage = delivery ? "Votre commande est prête et sera bientôt remise au livreur." : "Votre commande est prête à être retirée au restaurant."; }
            case "REMIS" -> { title = "Commande remise"; statusMessage = "Votre commande vous a été remise. Merci !"; }
            case "LIVREE" -> { title = "Commande livrée"; statusMessage = "Votre commande vient d'être livrée."; }
            case "ANNULEE" -> { title = "Commande annulée"; statusMessage = "Votre commande a été annulée par le restaurant."; }
            default -> { return; }
        }
        String body = """
                Bonjour %s,

                %s
                Référence : %s

                Suivez votre commande depuis le lien reçu lors de la confirmation.

                À bientôt,
                La Maison Orientale
                """.formatted(nom, statusMessage, reference);
        try {
            sendPlain(clientEmail.trim(), "La Maison Orientale — " + title.toLowerCase(), body, restaurantTo, null);
        } catch (EmailDeliveryException ex) {
            log.warn("E-mail statut commande non envoyé au client {} : {}", clientEmail, ex.getMessage());
        }
    }

    @Override
    public void sendAgentInviteEmail(String to, String nom, String activationLink) {
        ensureFromConfigured();
        String greeting = StringUtils.hasText(nom) ? "Bonjour " + nom.trim() + ",\n\n" : "Bonjour,\n\n";
        sendPlain(
                to,
                "Invitation — Activez votre compte agent (La Maison Orientale)",
                greeting
                        + "Un administrateur vous a créé un compte agent pour gérer le site de La Maison Orientale.\n\n"
                        + "Pour activer votre compte et choisir votre mot de passe, cliquez sur ce lien :\n"
                        + activationLink
                        + "\n\n"
                        + "Ce lien expire sous 72 heures.\n\n"
                        + "Si vous n'êtes pas concerné, ignorez cet e-mail.\n\n"
                        + "À bientôt,\n"
                        + "La Maison Orientale",
                null,
                "Impossible d'envoyer l'e-mail d'invitation.");
    }

    @Override
    public void sendAgentPasswordResetEmail(String to, String nom, String resetLink) {
        ensureFromConfigured();
        String greeting = StringUtils.hasText(nom) ? "Bonjour " + nom.trim() + ",\n\n" : "Bonjour,\n\n";
        sendPlain(
                to,
                "Réinitialisation — Mot de passe agent (La Maison Orientale)",
                greeting
                        + "Un administrateur a demandé la réinitialisation de votre mot de passe.\n\n"
                        + "Choisissez un nouveau mot de passe via ce lien :\n"
                        + resetLink
                        + "\n\n"
                        + "Ce lien expire sous 24 heures.\n\n"
                        + "Si vous n'êtes pas concerné, ignorez cet e-mail.\n\n"
                        + "À bientôt,\n"
                        + "La Maison Orientale",
                null,
                "Impossible d'envoyer l'e-mail de réinitialisation.");
    }

    @Override
    public void sendContactReplyToClient(
            String clientEmail, String nom, String sujetOriginal, String messageOriginal, String reponse) {
        if (!StringUtils.hasText(clientEmail)) {
            throw new IllegalArgumentException("Ce client n'a pas d'adresse e-mail.");
        }
        ensureConfigured();

        String greeting = StringUtils.hasText(nom) ? "Bonjour " + nom.trim() + ",\n\n" : "Bonjour,\n\n";
        String subjectLabel = StringUtils.hasText(sujetOriginal) ? sujetOriginal.trim() : "votre message";
        String body = greeting
                + "Merci pour votre message concernant « "
                + subjectLabel
                + " ».\n\n"
                + "Voici notre réponse :\n\n"
                + reponse.trim()
                + "\n\n"
                + "—\n"
                + "Votre message initial :\n"
                + messageOriginal.trim()
                + "\n\n"
                + "La Maison Orientale\n"
                + "Rue Jules Destrée 219, 7390 Quaregnon\n"
                + "Tél. "
                + restaurantPhone;

        sendPlain(
                clientEmail.trim(),
                "Re : " + subjectLabel + " — La Maison Orientale",
                body,
                restaurantTo,
                "Impossible d'envoyer la réponse au client.");
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

    private void ensureFromConfigured() {
        if (!StringUtils.hasText(from)) {
            throw new EmailDeliveryException(
                    "Configuration mail incomplète : définissez MAIL_FROM dans .env");
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
