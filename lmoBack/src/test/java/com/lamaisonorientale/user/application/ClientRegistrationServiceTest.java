package com.lamaisonorientale.user.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.lamaisonorientale.commande.infrastructure.CommandeRepository;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ClientSignUpRequest;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class ClientRegistrationServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ClientRegistrationService clientRegistrationService;

    @Test
    void register_ShouldCreateClient_WhenEmailIsFree() {
        ClientSignUpRequest request =
                new ClientSignUpRequest("Dupont", "  NEW@test.local  ", "password123", "0498672262");

        when(utilisateurRepository.existsByEmailIgnoreCase("new@test.local")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(inv -> {
            Utilisateur user = inv.getArgument(0);
            user.setId(10L);
            return user;
        });
        when(reservationRepository.findByEmailClientIgnoreCaseOrderByCreatedAtDesc("new@test.local"))
                .thenReturn(List.of());
        when(commandeRepository.findByEmailClientIgnoreCaseOrderByCreatedAtDesc("new@test.local"))
                .thenReturn(List.of());

        Utilisateur saved = clientRegistrationService.register(request);

        assertThat(saved.getEmail()).isEqualTo("new@test.local");
        assertThat(saved.getRole()).isEqualTo(RoleUtilisateur.CLIENT);
        assertThat(saved.isActif()).isTrue();
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void register_ShouldRejectDuplicateEmail() {
        ClientSignUpRequest request =
                new ClientSignUpRequest("Dupont", "existing@test.local", "password123", "0498672262");

        when(utilisateurRepository.existsByEmailIgnoreCase("existing@test.local")).thenReturn(true);

        assertThatThrownBy(() -> clientRegistrationService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("existe déjà");

        verify(utilisateurRepository, never()).save(any());
    }
}
