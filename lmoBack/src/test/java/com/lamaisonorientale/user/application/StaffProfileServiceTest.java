package com.lamaisonorientale.user.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.security.services.JwtService;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ChangePasswordRequest;
import com.lamaisonorientale.user.dto.StaffProfileDto;
import com.lamaisonorientale.user.dto.UpdateProfileRequest;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class StaffProfileServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private StaffProfileService staffProfileService;

    private Utilisateur admin;

    @BeforeEach
    void setUp() {
        admin = Utilisateur.builder()
                .id(1L)
                .email("admin@test.local")
                .motDePasseHash("encoded-old")
                .nom("Admin")
                .role(RoleUtilisateur.ADMIN)
                .actif(true)
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();
    }

    @Test
    void getProfile_ShouldReturnStaffProfile() {
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(admin));

        StaffProfileDto profile = staffProfileService.getProfile(admin);

        assertThat(profile.email()).isEqualTo("admin@test.local");
        assertThat(profile.role()).isEqualTo("ADMIN");
    }

    @Test
    void updateProfile_ShouldSaveAndReturnToken() {
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(utilisateurRepository.existsByEmailIgnoreCaseAndIdNot("admin-updated@test.local", 1L))
                .thenReturn(false);
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(any(Utilisateur.class))).thenReturn("new-token");

        JwtAuthenticationResponse response = staffProfileService.updateProfile(
                admin, new UpdateProfileRequest("Admin Updated", "admin-updated@test.local"));

        assertThat(response.getToken()).isEqualTo("new-token");
        assertThat(response.getEmail()).isEqualTo("admin-updated@test.local");
        verify(utilisateurRepository).save(admin);
    }

    @Test
    void changePassword_ShouldRejectWrongCurrentPassword() {
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("wrong", "encoded-old")).thenReturn(false);

        assertThatThrownBy(() -> staffProfileService.changePassword(
                        admin, new ChangePasswordRequest("wrong", "newpassword123")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Mot de passe actuel incorrect");
    }

    @Test
    void changePassword_ShouldUpdateHash_WhenCurrentPasswordMatches() {
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("oldpassword123", "encoded-old")).thenReturn(true);
        when(passwordEncoder.encode("newpassword123")).thenReturn("encoded-new");
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(inv -> inv.getArgument(0));

        staffProfileService.changePassword(
                admin, new ChangePasswordRequest("oldpassword123", "newpassword123"));

        assertThat(admin.getMotDePasseHash()).isEqualTo("encoded-new");
        verify(utilisateurRepository).save(admin);
    }
}
