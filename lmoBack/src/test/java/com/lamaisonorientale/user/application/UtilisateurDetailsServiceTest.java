package com.lamaisonorientale.user.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class UtilisateurDetailsServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private UtilisateurDetailsService utilisateurDetailsService;

    @Test
    void loadUserByUsername_ShouldReturnUserDetails() {
        Utilisateur user = Utilisateur.builder()
                .id(1L)
                .email("admin@test.local")
                .motDePasseHash("hash")
                .nom("Admin")
                .role(RoleUtilisateur.ADMIN)
                .actif(true)
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();

        when(utilisateurRepository.findByEmailIgnoreCase("admin@test.local")).thenReturn(Optional.of(user));

        UserDetails details = utilisateurDetailsService.loadUserByUsername("admin@test.local");

        assertThat(details.getUsername()).isEqualTo("admin@test.local");
        assertThat(details.getAuthorities()).extracting("authority").containsExactly("ROLE_ADMIN");
    }

    @Test
    void loadUserByUsername_ShouldThrow_WhenUserNotFound() {
        when(utilisateurRepository.findByEmailIgnoreCase("missing@test.local")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> utilisateurDetailsService.loadUserByUsername("missing@test.local"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("Compte introuvable");
    }
}
