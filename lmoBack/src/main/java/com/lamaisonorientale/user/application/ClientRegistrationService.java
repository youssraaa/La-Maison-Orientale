package com.lamaisonorientale.user.application;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.commande.infrastructure.CommandeRepository;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ClientSignUpRequest;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@Service
public class ClientRegistrationService {

    private final UtilisateurRepository utilisateurRepository;
    private final ReservationRepository reservationRepository;
    private final CommandeRepository commandeRepository;
    private final PasswordEncoder passwordEncoder;

    public ClientRegistrationService(
            UtilisateurRepository utilisateurRepository,
            ReservationRepository reservationRepository,
            CommandeRepository commandeRepository,
            PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.reservationRepository = reservationRepository;
        this.commandeRepository = commandeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Utilisateur register(ClientSignUpRequest request) {
        String email = normalizeEmail(request.email());
        if (utilisateurRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet e-mail.");
        }

        Utilisateur user = Utilisateur.builder()
                .email(email)
                .nom(request.nom().trim())
                .telephone(trimToNull(request.telephone()))
                .motDePasseHash(passwordEncoder.encode(request.password()))
                .role(RoleUtilisateur.CLIENT)
                .actif(true)
                .createdAt(Instant.now())
                .build();

        Utilisateur saved = utilisateurRepository.save(user);
        linkPastActivity(saved);
        return saved;
    }

    @Transactional
    public void linkPastActivity(Utilisateur user) {
        reservationRepository.findByEmailClientIgnoreCaseOrderByCreatedAtDesc(user.getEmail()).stream()
                .filter(r -> r.getUtilisateurId() == null)
                .forEach(r -> r.setUtilisateurId(user.getId()));
        commandeRepository.findByEmailClientIgnoreCaseOrderByCreatedAtDesc(user.getEmail()).stream()
                .filter(c -> c.getUtilisateurId() == null)
                .forEach(c -> c.setUtilisateurId(user.getId()));
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
