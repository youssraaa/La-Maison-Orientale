package com.lamaisonorientale.security.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.security.dto.SignInRequest;
import com.lamaisonorientale.user.application.ClientRegistrationService;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ClientSignUpRequest;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private ClientRegistrationService clientRegistrationService;

    @InjectMocks
    private AuthenticationService authenticationService;

    private Utilisateur clientUser;

    @BeforeEach
    void setUp() {
        clientUser = Utilisateur.builder()
                .id(1L)
                .email("client@test.local")
                .nom("Dupont")
                .motDePasseHash("hash")
                .role(RoleUtilisateur.CLIENT)
                .actif(true)
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void signinClient_ShouldReturnToken_WhenRoleIsClient() {
        SignInRequest request = SignInRequest.builder()
                .email("client@test.local")
                .password("password123")
                .build();

        when(utilisateurRepository.findByEmailIgnoreCase("client@test.local")).thenReturn(Optional.of(clientUser));
        when(jwtService.generateToken(clientUser)).thenReturn("jwt-token");

        JwtAuthenticationResponse response = authenticationService.signinClient(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getRole()).isEqualTo("CLIENT");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void signinClient_ShouldRejectStaffAccount() {
        Utilisateur admin = Utilisateur.builder()
                .id(2L)
                .email("admin@test.local")
                .nom("Admin")
                .motDePasseHash("hash")
                .role(RoleUtilisateur.ADMIN)
                .actif(true)
                .createdAt(Instant.now())
                .build();

        SignInRequest request = SignInRequest.builder()
                .email("admin@test.local")
                .password("password123")
                .build();

        when(utilisateurRepository.findByEmailIgnoreCase("admin@test.local")).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> authenticationService.signinClient(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("E-mail ou mot de passe incorrect");
    }

    @Test
    void signupClient_ShouldReturnToken() {
        ClientSignUpRequest request =
                new ClientSignUpRequest("Dupont", "new@test.local", "password123", "0498672262");

        when(clientRegistrationService.register(request)).thenReturn(clientUser);
        when(jwtService.generateToken(clientUser)).thenReturn("signup-token");

        JwtAuthenticationResponse response = authenticationService.signupClient(request);

        assertThat(response.getToken()).isEqualTo("signup-token");
        assertThat(response.getRole()).isEqualTo("CLIENT");
    }
}
