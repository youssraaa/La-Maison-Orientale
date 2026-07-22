package com.lamaisonorientale.email;

import java.time.Instant;

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
}
