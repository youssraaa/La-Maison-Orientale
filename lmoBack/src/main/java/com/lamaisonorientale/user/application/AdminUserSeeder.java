package com.lamaisonorientale.user.application;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

/**
 * Crée le compte admin initial s'il n'existe pas encore (comme le bootstrap GLOP).
 * Identifiants uniquement via variables d'environnement.
 */
@Component
@RequiredArgsConstructor
public class AdminUserSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserSeeder.class);

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${lmo.admin.email:}")
    private String adminEmail;

    @Value("${lmo.admin.password:}")
    private String adminPassword;

    @Value("${lmo.admin.nom:Administrateur}")
    private String adminNom;

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("Admin non seedé : définir LMO_ADMIN_EMAIL et LMO_ADMIN_PASSWORD.");
            return;
        }

        if (adminPassword.length() < 8) {
            log.error("Mot de passe admin trop court (min. 8 caractères) — seed annulé.");
            return;
        }

        String email = adminEmail.trim().toLowerCase();
        String hash = passwordEncoder.encode(adminPassword);

        utilisateurRepository
                .findByEmailIgnoreCase(email)
                .ifPresentOrElse(
                        existing -> {
                            existing.setMotDePasseHash(hash);
                            existing.setActif(true);
                            if (existing.getRole() == null) {
                                existing.setRole(RoleUtilisateur.ADMIN);
                            }
                            utilisateurRepository.save(existing);
                            log.info("Mot de passe admin mis à jour : {}", email);
                        },
                        () -> {
                            Utilisateur admin = Utilisateur.builder()
                                    .email(email)
                                    .motDePasseHash(hash)
                                    .nom(adminNom)
                                    .role(RoleUtilisateur.ADMIN)
                                    .actif(true)
                                    .createdAt(Instant.now())
                                    .build();
                            utilisateurRepository.save(admin);
                            log.info("Compte admin créé : {}", email);
                        });
    }
}
