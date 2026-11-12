package com.lamaisonorientale.notification.application;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.notification.domain.Notification;
import com.lamaisonorientale.notification.domain.NotificationType;
import com.lamaisonorientale.notification.dto.NotificationDto;
import com.lamaisonorientale.notification.infrastructure.NotificationRepository;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;

    public NotificationService(
            NotificationRepository notificationRepository, UtilisateurRepository utilisateurRepository) {
        this.notificationRepository = notificationRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listForUser(Long userId) {
        return notificationRepository.findByUtilisateurIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUtilisateurIdAndLueFalse(userId);
    }

    @Transactional
    public NotificationDto markRead(Long userId, Long id) {
        Notification n = requireOwned(userId, id);
        n.setLue(true);
        return toDto(notificationRepository.save(n));
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.findByUtilisateurIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> !Boolean.TRUE.equals(n.getLue()))
                .forEach(n -> n.setLue(true));
    }

    @Transactional
    public void notifyAdmins(NotificationType type, String titre, String message, String lien) {
        notifyRoles(List.of(RoleUtilisateur.ADMIN), type, titre, message, lien);
    }

    /** Alertes opérationnelles : administrateurs + agents actifs (réservations, messages…). */
    @Transactional
    public void notifyStaff(NotificationType type, String titre, String message, String lien) {
        notifyRoles(List.of(RoleUtilisateur.ADMIN, RoleUtilisateur.AGENT), type, titre, message, lien);
    }

    private void notifyRoles(
            List<RoleUtilisateur> roles,
            NotificationType type,
            String titre,
            String message,
            String lien) {
        List<Utilisateur> recipients =
                utilisateurRepository.findByRoleInAndActifTrueOrderByNomAscEmailAsc(roles);
        for (Utilisateur user : recipients) {
            create(user.getId(), type, titre, message, lien);
        }
    }

    @Transactional
    public void notifyUser(Long userId, NotificationType type, String titre, String message, String lien) {
        create(userId, type, titre, message, lien);
    }

    @Transactional
    public void notifyClientByEmail(
            String email, NotificationType type, String titre, String message, String lien) {
        if (!StringUtils.hasText(email)) {
            return;
        }
        utilisateurRepository
                .findByEmailIgnoreCase(email.trim())
                .filter(user -> user.getRole() == RoleUtilisateur.CLIENT && user.isActif())
                .ifPresent(user -> notifyUser(user.getId(), type, titre, message, lien));
    }

    private void create(Long userId, NotificationType type, String titre, String message, String lien) {
        Notification n = new Notification();
        n.setUtilisateurId(userId);
        n.setType(type);
        n.setTitre(titre);
        n.setMessage(message);
        n.setLien(lien);
        n.setLue(false);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    private Notification requireOwned(Long userId, Long id) {
        Notification n = notificationRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable."));
        if (!n.getUtilisateurId().equals(userId)) {
            throw new IllegalArgumentException("Notification introuvable.");
        }
        return n;
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType().name(),
                n.getTitre(),
                n.getMessage(),
                n.getLien(),
                Boolean.TRUE.equals(n.getLue()),
                n.getCreatedAt());
    }
}
