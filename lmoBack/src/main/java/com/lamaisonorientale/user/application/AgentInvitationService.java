package com.lamaisonorientale.user.application;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.user.domain.UserToken;
import com.lamaisonorientale.user.domain.UserTokenType;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UserTokenRepository;

@Service
public class AgentInvitationService {

    private static final int INVITE_HOURS = 72;
    private static final int RESET_HOURS = 24;

    private final UserTokenRepository userTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${lmo.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public AgentInvitationService(
            UserTokenRepository userTokenRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.userTokenRepository = userTokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /** Hash impossible à deviner : le compte reste inactif jusqu'à acceptation. */
    public String placeholderPasswordHash() {
        return passwordEncoder.encode("LMO-INVITE-PENDING-" + UUID.randomUUID());
    }

    @Transactional
    public void sendInvitation(Utilisateur agent) {
        String token = createToken(agent, UserTokenType.INVITE_AGENT, INVITE_HOURS);
        String link = frontendUrl.replaceAll("/$", "") + "/admin/activer-compte?token=" + token;
        emailService.sendAgentInviteEmail(agent.getEmail(), UserDisplayName.of(agent), link);
    }

    @Transactional
    public void sendPasswordReset(Utilisateur agent) {
        String token = createToken(agent, UserTokenType.RESET_PASSWORD, RESET_HOURS);
        String link = frontendUrl.replaceAll("/$", "") + "/admin/reinitialiser-mot-de-passe?token=" + token;
        emailService.sendAgentPasswordResetEmail(agent.getEmail(), UserDisplayName.of(agent), link);
    }

    @Transactional(readOnly = true)
    public InvitePreview previewInvite(String token) {
        UserToken invite = requireValidToken(token, UserTokenType.INVITE_AGENT);
        Utilisateur u = invite.getUtilisateur();
        return new InvitePreview(u.getEmail(), UserDisplayName.of(u), invite.isExpired(), invite.isUsed());
    }

    @Transactional(readOnly = true)
    public InvitePreview previewReset(String token) {
        UserToken reset = requireValidToken(token, UserTokenType.RESET_PASSWORD);
        Utilisateur u = reset.getUtilisateur();
        return new InvitePreview(u.getEmail(), UserDisplayName.of(u), reset.isExpired(), reset.isUsed());
    }

    @Transactional
    public void acceptInvite(String token, String password) {
        validatePassword(password);
        UserToken invite = requireValidToken(token, UserTokenType.INVITE_AGENT);
        if (invite.isUsed()) {
            throw new IllegalArgumentException("Cette invitation a déjà été utilisée.");
        }
        if (invite.isExpired()) {
            throw new IllegalArgumentException("Cette invitation a expiré. Contactez l'administrateur.");
        }

        Utilisateur agent = invite.getUtilisateur();
        agent.setMotDePasseHash(passwordEncoder.encode(password));
        agent.setActif(true);
        invite.setUsedAt(Instant.now());
    }

    @Transactional
    public void acceptPasswordReset(String token, String password) {
        validatePassword(password);
        UserToken reset = requireValidToken(token, UserTokenType.RESET_PASSWORD);
        if (reset.isUsed()) {
            throw new IllegalArgumentException("Ce lien a déjà été utilisé.");
        }
        if (reset.isExpired()) {
            throw new IllegalArgumentException("Ce lien a expiré. Demandez une nouvelle réinitialisation.");
        }

        Utilisateur agent = reset.getUtilisateur();
        agent.setMotDePasseHash(passwordEncoder.encode(password));
        reset.setUsedAt(Instant.now());
    }

    private String createToken(Utilisateur user, UserTokenType type, int hours) {
        String token = UUID.randomUUID().toString().replace("-", "");
        UserToken row = new UserToken();
        row.setUtilisateur(user);
        row.setToken(token);
        row.setType(type);
        row.setExpiresAt(Instant.now().plusSeconds(hours * 3600L));
        row.setCreatedAt(Instant.now());
        userTokenRepository.save(row);
        return token;
    }

    private UserToken requireValidToken(String token, UserTokenType type) {
        return userTokenRepository
                .findByTokenAndType(token, type)
                .orElseThrow(() -> new IllegalArgumentException("Lien invalide ou expiré."));
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Mot de passe : 8 caractères minimum.");
        }
    }

    public record InvitePreview(String email, String nom, boolean expired, boolean used) {}
}
