package com.lamaisonorientale.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.security.dto.AcceptInviteRequest;
import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.security.dto.SignInRequest;
import com.lamaisonorientale.security.services.AuthenticationService;
import com.lamaisonorientale.user.application.AgentInvitationService;
import com.lamaisonorientale.user.dto.ClientSignUpRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final AgentInvitationService agentInvitationService;

    @PostMapping("/signin")
    public ResponseEntity<JwtAuthenticationResponse> signin(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(authenticationService.signinStaff(request));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> login(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/client/signup")
    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public ResponseEntity<JwtAuthenticationResponse> clientSignup(@Valid @RequestBody ClientSignUpRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(authenticationService.signupClient(request));
    }

    @PostMapping("/client/signin")
    public ResponseEntity<JwtAuthenticationResponse> clientSignin(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(authenticationService.signinClient(request));
    }

    @GetMapping("/invite/{token}")
    public ResponseEntity<AgentInvitationService.InvitePreview> previewInvite(@PathVariable String token) {
        return ResponseEntity.ok(agentInvitationService.previewInvite(token));
    }

    @GetMapping("/reset/{token}")
    public ResponseEntity<AgentInvitationService.InvitePreview> previewReset(@PathVariable String token) {
        return ResponseEntity.ok(agentInvitationService.previewReset(token));
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<Void> acceptInvite(@Valid @RequestBody AcceptInviteRequest request) {
        agentInvitationService.acceptInvite(request.token(), request.password());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/accept-reset")
    public ResponseEntity<Void> acceptReset(@Valid @RequestBody AcceptInviteRequest request) {
        agentInvitationService.acceptPasswordReset(request.token(), request.password());
        return ResponseEntity.noContent().build();
    }
}
