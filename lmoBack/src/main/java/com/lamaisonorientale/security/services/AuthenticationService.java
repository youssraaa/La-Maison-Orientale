package com.lamaisonorientale.security.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.security.dto.SignInRequest;
import com.lamaisonorientale.user.application.ClientRegistrationService;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ClientSignUpRequest;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ClientRegistrationService clientRegistrationService;

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    public JwtAuthenticationResponse signinStaff(SignInRequest request) {
        JwtAuthenticationResponse response = authenticate(request);
        if (RoleUtilisateur.CLIENT.name().equals(response.getRole())) {
            throw new IllegalArgumentException("Utilisez l'espace client pour vous connecter.");
        }
        return response;
    }

    public JwtAuthenticationResponse login(SignInRequest request) {
        return authenticate(request);
    }

    public JwtAuthenticationResponse signinClient(SignInRequest request) {
        JwtAuthenticationResponse response = authenticate(request);
        if (!RoleUtilisateur.CLIENT.name().equals(response.getRole())) {
            throw new IllegalArgumentException("E-mail ou mot de passe incorrect.");
        }
        return response;
    }

    public JwtAuthenticationResponse signupClient(ClientSignUpRequest request) {
        Utilisateur user = clientRegistrationService.register(request);
        String jwt = jwtService.generateToken(user);
        return JwtAuthenticationResponse.builder()
                .token(jwt)
                .role(user.getRole().name())
                .userId(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .build();
    }

    private JwtAuthenticationResponse authenticate(SignInRequest request) {
        String email = normalizeEmail(request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        Utilisateur user = utilisateurRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("E-mail ou mot de passe incorrect."));

        if (!user.isActif()) {
            throw new IllegalArgumentException("Ce compte est désactivé.");
        }

        String jwt = jwtService.generateToken(user);

        return JwtAuthenticationResponse.builder()
                .token(jwt)
                .role(user.getRole().name())
                .userId(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .build();
    }
}
