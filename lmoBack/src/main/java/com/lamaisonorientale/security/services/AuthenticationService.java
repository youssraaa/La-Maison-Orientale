package com.lamaisonorientale.security.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.security.dto.SignInRequest;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    public JwtAuthenticationResponse signin(SignInRequest request) {
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
