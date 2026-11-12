package com.lamaisonorientale.user.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.commande.dto.PublicCommandeDetailDto;
import com.lamaisonorientale.notification.dto.NotificationDto;
import com.lamaisonorientale.reservation.dto.PublicReservationDetailDto;
import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.user.application.ClientAccountService;
import com.lamaisonorientale.user.dto.ChangePasswordRequest;
import com.lamaisonorientale.user.dto.ClientMessageDto;
import com.lamaisonorientale.user.dto.ClientProfileDto;
import com.lamaisonorientale.user.dto.ClientUpdateProfileRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/client")
public class ClientAccountController {

    private final ClientAccountService clientAccountService;

    public ClientAccountController(ClientAccountService clientAccountService) {
        this.clientAccountService = clientAccountService;
    }

    @GetMapping("/me")
    public ClientProfileDto profile() {
        return clientAccountService.profile();
    }

    @PutMapping("/me")
    public JwtAuthenticationResponse updateProfile(@Valid @RequestBody ClientUpdateProfileRequest request) {
        return clientAccountService.updateProfile(request);
    }

    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        clientAccountService.changePassword(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reservations")
    public List<PublicReservationDetailDto> reservations() {
        return clientAccountService.myReservations();
    }

    @GetMapping("/commandes")
    public List<PublicCommandeDetailDto> commandes() {
        return clientAccountService.myCommandes();
    }

    @GetMapping("/messages")
    public List<ClientMessageDto> messages() {
        return clientAccountService.myMessages();
    }

    @GetMapping("/notifications")
    public List<NotificationDto> notifications() {
        return clientAccountService.myNotifications();
    }

    @GetMapping("/notifications/unread-count")
    public Map<String, Long> unreadNotificationCount() {
        return Map.of("count", clientAccountService.unreadNotificationCount());
    }

    @PatchMapping("/notifications/{id}/read")
    public NotificationDto markNotificationRead(@PathVariable Long id) {
        return clientAccountService.markNotificationRead(id);
    }

    @PostMapping("/notifications/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> markAllNotificationsRead() {
        clientAccountService.markAllNotificationsRead();
        return ResponseEntity.noContent().build();
    }
}
