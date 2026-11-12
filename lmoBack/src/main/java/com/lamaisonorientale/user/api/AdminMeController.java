package com.lamaisonorientale.user.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.user.application.StaffProfileService;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ChangePasswordRequest;
import com.lamaisonorientale.user.dto.StaffProfileDto;
import com.lamaisonorientale.user.dto.UpdateProfileRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminMeController {

    private final StaffProfileService staffProfileService;

    public AdminMeController(StaffProfileService staffProfileService) {
        this.staffProfileService = staffProfileService;
    }

    @GetMapping("/me")
    public StaffProfileDto me(@AuthenticationPrincipal Utilisateur user) {
        return staffProfileService.getProfile(user);
    }

    @PutMapping("/me")
    public JwtAuthenticationResponse updateProfile(
            @AuthenticationPrincipal Utilisateur user,
            @Valid @RequestBody UpdateProfileRequest request) {
        return staffProfileService.updateProfile(user, request);
    }

    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal Utilisateur user,
            @Valid @RequestBody ChangePasswordRequest request) {
        staffProfileService.changePassword(user, request);
        return ResponseEntity.noContent().build();
    }
}
