package com.lamaisonorientale.user.application;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.security.services.JwtService;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ChangePasswordRequest;
import com.lamaisonorientale.user.dto.StaffProfileDto;
import com.lamaisonorientale.user.dto.UpdateProfileRequest;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@Service
public class StaffProfileService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public StaffProfileService(
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public StaffProfileDto getProfile(Utilisateur current) {
        Utilisateur user = requireUser(current.getId());
        return toDto(user);
    }

    @Transactional
    public JwtAuthenticationResponse updateProfile(Utilisateur current, UpdateProfileRequest request) {
        Utilisateur user = requireUser(current.getId());
        String email = normalizeEmail(request.email());

        if (utilisateurRepository.existsByEmailIgnoreCaseAndIdNot(email, user.getId())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet e-mail.");
        }

        user.setNom(request.nom().trim());
        user.setEmail(email);
        utilisateurRepository.save(user);

        String token = jwtService.generateToken(user);
        return JwtAuthenticationResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public void changePassword(Utilisateur current, ChangePasswordRequest request) {
        Utilisateur user = requireUser(current.getId());

        if (!passwordEncoder.matches(request.currentPassword(), user.getMotDePasseHash())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect.");
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new IllegalArgumentException(
                    "Le nouveau mot de passe doit être différent de l'actuel.");
        }

        user.setMotDePasseHash(passwordEncoder.encode(request.newPassword()));
        utilisateurRepository.save(user);
    }

    private Utilisateur requireUser(Long id) {
        return utilisateurRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compte introuvable."));
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private StaffProfileDto toDto(Utilisateur user) {
        return new StaffProfileDto(
                user.getId(),
                user.getNom(),
                user.getEmail(),
                user.getRole().name(),
                user.isActif(),
                user.getCreatedAt());
    }
}
