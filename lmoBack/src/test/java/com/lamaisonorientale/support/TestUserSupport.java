package com.lamaisonorientale.support;

import java.time.Instant;

import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;

public final class TestUserSupport {

    private TestUserSupport() {}

    public static Utilisateur adminUser() {
        return Utilisateur.builder()
                .id(1L)
                .email("admin@test.local")
                .motDePasseHash("hash")
                .nom("Admin")
                .prenom("Test")
                .role(RoleUtilisateur.ADMIN)
                .actif(true)
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();
    }

    public static Utilisateur agentUser() {
        return Utilisateur.builder()
                .id(2L)
                .email("agent@test.local")
                .motDePasseHash("hash")
                .nom("Agent")
                .prenom("Test")
                .role(RoleUtilisateur.AGENT)
                .actif(true)
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();
    }
}
