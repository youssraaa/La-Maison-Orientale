package com.lamaisonorientale.user.application;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.commande.application.CommandeService;
import com.lamaisonorientale.commande.dto.PublicCommandeDetailDto;
import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.notification.dto.NotificationDto;
import com.lamaisonorientale.reservation.application.ReservationService;
import com.lamaisonorientale.reservation.dto.PublicReservationDetailDto;
import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.security.services.JwtService;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ChangePasswordRequest;
import com.lamaisonorientale.user.dto.ClientMessageDto;
import com.lamaisonorientale.user.dto.ClientProfileDto;
import com.lamaisonorientale.user.dto.ClientUpdateProfileRequest;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@Service
public class ClientAccountService {

    private final UtilisateurRepository utilisateurRepository;
    private final ReservationService reservationService;
    private final CommandeService commandeService;
    private final DemandeClientRepository demandeClientRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ClientAccountService(
            UtilisateurRepository utilisateurRepository,
            ReservationService reservationService,
            CommandeService commandeService,
            DemandeClientRepository demandeClientRepository,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.utilisateurRepository = utilisateurRepository;
        this.reservationService = reservationService;
        this.commandeService = commandeService;
        this.demandeClientRepository = demandeClientRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public ClientProfileDto profile() {
        return toDto(currentClient());
    }

    @Transactional
    public JwtAuthenticationResponse updateProfile(ClientUpdateProfileRequest request) {
        Utilisateur user = currentClient();
        String email = normalizeEmail(request.email());

        if (utilisateurRepository.existsByEmailIgnoreCaseAndIdNot(email, user.getId())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet e-mail.");
        }

        user.setNom(request.nom().trim());
        user.setPrenom(request.prenom().trim());
        user.setEmail(email);
        user.setTelephone(trimToNull(request.telephone()));
        user.setPays(trimToNull(request.pays()));
        user.setAdresse(trimToNull(request.adresse()));
        user.setVille(trimToNull(request.ville()));
        user.setCodePostal(trimToNull(request.codePostal()));
        user.setAdresseLivraison(trimToNull(request.adresseLivraison()));
        user.setCodePostalLivraison(trimToNull(request.codePostalLivraison()));
        user.setVilleLivraison(trimToNull(request.villeLivraison()));
        utilisateurRepository.save(user);

        String token = jwtService.generateToken(user);
        String displayName = buildDisplayName(user);
        return JwtAuthenticationResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .nom(displayName)
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Utilisateur user = currentClient();

        if (!passwordEncoder.matches(request.currentPassword(), user.getMotDePasseHash())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect.");
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit être différent de l'actuel.");
        }

        user.setMotDePasseHash(passwordEncoder.encode(request.newPassword()));
        utilisateurRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<PublicReservationDetailDto> myReservations() {
        return reservationService.listForUser(currentClient().getId());
    }

    @Transactional(readOnly = true)
    public List<PublicCommandeDetailDto> myCommandes() {
        return commandeService.listForUser(currentClient().getId());
    }

    @Transactional(readOnly = true)
    public List<ClientMessageDto> myMessages() {
        Utilisateur user = currentClient();
        String email = user.getEmail();
        if (!StringUtils.hasText(email)) {
            return List.of();
        }
        return demandeClientRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email.trim()).stream()
                .map(this::toClientMessage)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> myNotifications() {
        return notificationService.listForUser(currentClient().getId());
    }

    @Transactional(readOnly = true)
    public long unreadNotificationCount() {
        return notificationService.unreadCount(currentClient().getId());
    }

    @Transactional
    public NotificationDto markNotificationRead(Long id) {
        return notificationService.markRead(currentClient().getId(), id);
    }

    @Transactional
    public void markAllNotificationsRead() {
        notificationService.markAllRead(currentClient().getId());
    }

    private ClientMessageDto toClientMessage(DemandeClient demande) {
        return new ClientMessageDto(
                demande.getId(),
                demande.getSujet(),
                demande.getMessage(),
                demande.getStatut() != null ? demande.getStatut().name() : "NOUVELLE",
                demande.getCreatedAt(),
                demande.getReponseAt(),
                demande.getReponseClient());
    }

    private Utilisateur currentClient() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur user = utilisateurRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Compte introuvable."));
        if (user.getRole() != RoleUtilisateur.CLIENT) {
            throw new IllegalArgumentException("Accès réservé aux clients.");
        }
        return user;
    }

    private ClientProfileDto toDto(Utilisateur user) {
        String prenom = user.getPrenom();
        String nom = user.getNom();
        if (!StringUtils.hasText(prenom) && StringUtils.hasText(nom) && nom.contains(" ")) {
            String[] parts = nom.trim().split("\\s+", 2);
            prenom = parts[0];
            nom = parts.length > 1 ? parts[1] : "";
        }
        return new ClientProfileDto(
                user.getId(),
                nom,
                prenom,
                user.getEmail(),
                user.getTelephone(),
                user.getPays(),
                user.getAdresse(),
                user.getVille(),
                user.getCodePostal(),
                user.getAdresseLivraison(),
                user.getCodePostalLivraison(),
                user.getVilleLivraison(),
                user.getCreatedAt());
    }

    private static String buildDisplayName(Utilisateur user) {
        if (StringUtils.hasText(user.getPrenom()) && StringUtils.hasText(user.getNom())) {
            return user.getPrenom().trim() + " " + user.getNom().trim();
        }
        if (StringUtils.hasText(user.getPrenom())) {
            return user.getPrenom().trim();
        }
        return user.getNom() != null ? user.getNom().trim() : "";
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
