package com.lamaisonorientale.demande.application;



import java.time.Instant;

import java.util.List;



import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.util.StringUtils;



import com.lamaisonorientale.demande.domain.DemandeClient;

import com.lamaisonorientale.demande.domain.StatutDemande;

import com.lamaisonorientale.demande.dto.AdminMessageDto;

import com.lamaisonorientale.demande.dto.InternalMessageNoteRequest;

import com.lamaisonorientale.demande.dto.ReplyMessageRequest;

import com.lamaisonorientale.demande.dto.UpdateDemandeStatutRequest;

import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;

import com.lamaisonorientale.email.EmailService;

import com.lamaisonorientale.notification.application.NotificationService;

import com.lamaisonorientale.notification.domain.NotificationType;



@Service

public class AdminMessageService {



    private final DemandeClientRepository demandeClientRepository;

    private final EmailService emailService;

    private final NotificationService notificationService;



    public AdminMessageService(

            DemandeClientRepository demandeClientRepository,
            EmailService emailService,
            NotificationService notificationService) {

        this.demandeClientRepository = demandeClientRepository;

        this.emailService = emailService;

        this.notificationService = notificationService;

    }



    @Transactional(readOnly = true)

    public List<AdminMessageDto> list(String statut) {

        return demandeClientRepository.findAllByOrderByCreatedAtDesc().stream()

                .filter(d -> statut == null || statut.isBlank() || d.getStatut().name().equalsIgnoreCase(statut))

                .map(this::toDto)

                .toList();

    }



    @Transactional

    public AdminMessageDto updateStatut(Long id, UpdateDemandeStatutRequest request) {

        DemandeClient demande = demandeClientRepository

                .findById(id)

                .orElseThrow(() -> new IllegalArgumentException("Message introuvable."));



        StatutDemande next;

        try {

            next = StatutDemande.valueOf(request.statut().trim().toUpperCase());

        } catch (IllegalArgumentException ex) {

            throw new IllegalArgumentException("Statut de message invalide.");

        }



        demande.setStatut(next);

        DemandeClient saved = demandeClientRepository.save(demande);

        return toDto(saved);

    }



    @Transactional

    public AdminMessageDto reply(Long id, ReplyMessageRequest request) {

        DemandeClient demande = demandeClientRepository

                .findById(id)

                .orElseThrow(() -> new IllegalArgumentException("Message introuvable."));



        if (!StringUtils.hasText(demande.getEmail())) {

            throw new IllegalArgumentException("Impossible de répondre : aucune adresse e-mail pour ce client.");

        }



        String replyBody = request.reponse().trim();

        demande.setStatut(StatutDemande.TRAITEE);
        demande.setReponseClient(replyBody);
        demande.setReponseAt(Instant.now());
        DemandeClient saved = demandeClientRepository.save(demande);

        emailService.sendContactReplyToClient(
                demande.getEmail(),
                demande.getNom(),
                demande.getSujet(),
                demande.getMessage(),
                replyBody);

        String sujet = StringUtils.hasText(demande.getSujet()) ? demande.getSujet().trim() : "votre message";

        notificationService.notifyClientByEmail(
                demande.getEmail(),
                NotificationType.REPONSE_MESSAGE,
                "Réponse du restaurant",
                "Le restaurant a répondu à « " + sujet + " ». Consultez le détail dans Contacter le restaurant.",
                "/mon-compte/messages");

        return toDto(saved);

    }



    @Transactional

    public AdminMessageDto addInternalNote(Long id, InternalMessageNoteRequest request) {

        DemandeClient demande = demandeClientRepository

                .findById(id)

                .orElseThrow(() -> new IllegalArgumentException("Message introuvable."));



        demande.setReponseInterne(request.note().trim());

        demande.setReponseAt(Instant.now());

        demande.setStatut(StatutDemande.TRAITEE);

        DemandeClient saved = demandeClientRepository.save(demande);

        return toDto(saved);

    }



    private AdminMessageDto toDto(DemandeClient d) {

        return new AdminMessageDto(

                d.getId(),

                d.getNom(),

                d.getEmail(),

                d.getTelephone(),

                d.getSujet(),

                d.getMessage(),

                d.getTypeDemande().name(),

                d.getStatut().name(),

                d.getCreatedAt(),

                d.getReponseInterne(),

                d.getReponseClient(),

                d.getReponseAt());

    }

}


