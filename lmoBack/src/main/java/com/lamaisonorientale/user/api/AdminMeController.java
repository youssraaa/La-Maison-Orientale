package com.lamaisonorientale.user.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.user.domain.Utilisateur;

@RestController
@RequestMapping("/api/admin")
public class AdminMeController {

    @GetMapping("/me")
    public ResponseEntity<JwtAuthenticationResponse> me(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(JwtAuthenticationResponse.builder()
                .token(null)
                .role(user.getRole().name())
                .userId(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .build());
    }
}
