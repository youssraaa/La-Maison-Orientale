package com.lamaisonorientale.user.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.lamaisonorientale.commande.application.CommandeService;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.reservation.application.ReservationService;
import com.lamaisonorientale.reservation.dto.PublicReservationDetailDto;
import com.lamaisonorientale.security.services.JwtService;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ChangePasswordRequest;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class ClientAccountServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private ReservationService reservationService;

    @Mock
    private CommandeService commandeService;

    @Mock
    private DemandeClientRepository demandeClientRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private ClientAccountService clientAccountService;

    private Utilisateur client;

    @BeforeEach
    void setUp() {
        client = Utilisateur.builder()
                .id(5L)
                .email("client@test.local")
                .nom("Dupont")
                .prenom("Marie")
                .motDePasseHash("encoded-old")
                .role(RoleUtilisateur.CLIENT)
                .actif(true)
                .createdAt(Instant.now())
                .build();

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("client@test.local", "n/a"));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void profile_ShouldReturnCurrentClient() {
        when(utilisateurRepository.findByEmailIgnoreCase("client@test.local")).thenReturn(Optional.of(client));

        var profile = clientAccountService.profile();

        assertThat(profile.email()).isEqualTo("client@test.local");
        assertThat(profile.nom()).isEqualTo("Dupont");
    }

    @Test
    void myReservations_ShouldDelegateToReservationService() {
        when(utilisateurRepository.findByEmailIgnoreCase("client@test.local")).thenReturn(Optional.of(client));
        when(reservationService.listForUser(5L))
                .thenReturn(List.of(new PublicReservationDetailDto(
                        1L,
                        java.time.LocalDate.now().plusDays(2),
                        java.time.LocalTime.of(19, 0),
                        2,
                        "Dupont",
                        "client@test.local",
                        "0498672262",
                        null,
                        "CONFIRMEE",
                        Instant.now(),
                        true,
                        true,
                        "token-abc")));

        var reservations = clientAccountService.myReservations();

        assertThat(reservations).hasSize(1);
        verify(reservationService).listForUser(5L);
    }

    @Test
    void changePassword_ShouldRejectWrongCurrentPassword() {
        when(utilisateurRepository.findByEmailIgnoreCase("client@test.local")).thenReturn(Optional.of(client));
        when(passwordEncoder.matches("wrong", "encoded-old")).thenReturn(false);

        assertThatThrownBy(() -> clientAccountService.changePassword(
                        new ChangePasswordRequest("wrong", "newpassword123")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Mot de passe actuel incorrect");
    }
}
