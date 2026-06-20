package com.lamaisonorientale.demande.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.domain.StatutDemande;
import com.lamaisonorientale.demande.domain.TypeDemande;
import com.lamaisonorientale.demande.dto.ContactRequestDto;
import com.lamaisonorientale.demande.dto.ContactResponseDto;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.email.EmailDeliveryException;
import com.lamaisonorientale.email.EmailService;

@Service
public class ContactService {

    private final DemandeClientRepository repository;
    private final EmailService emailService;

    public ContactService(DemandeClientRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @Transactional(noRollbackFor = EmailDeliveryException.class)
    public ContactResponseDto submit(ContactRequestDto request) {
        if (!StringUtils.hasText(request.email()) && !StringUtils.hasText(request.telephone())) {
            throw new IllegalArgumentException(
                    "Indiquez au moins un e-mail ou un numéro de téléphone pour vous recontacter.");
        }

        DemandeClient demande = new DemandeClient();
        demande.setTypeDemande(TypeDemande.CONTACT);
        demande.setNom(request.nom().trim());
        demande.setEmail(trimToNull(request.email()));
        demande.setTelephone(trimToNull(request.telephone()));
        demande.setMessage(request.message().trim());
        demande.setStatut(StatutDemande.NOUVELLE);

        DemandeClient saved = repository.save(demande);

        emailService.sendContactNotificationToRestaurant(
                saved.getId(),
                saved.getNom(),
                saved.getEmail(),
                saved.getTelephone(),
                saved.getMessage(),
                saved.getCreatedAt());

        emailService.sendContactAcknowledgementToClient(
                saved.getEmail(),
                saved.getNom(),
                saved.getMessage());

        return new ContactResponseDto(
                saved.getId(),
                "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.",
                saved.getCreatedAt());
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
