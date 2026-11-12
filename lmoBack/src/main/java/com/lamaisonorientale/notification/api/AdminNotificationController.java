package com.lamaisonorientale.notification.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.notification.dto.NotificationDto;
import com.lamaisonorientale.user.domain.Utilisateur;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto> list(@AuthenticationPrincipal Utilisateur user) {
        return notificationService.listForUser(user.getId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal Utilisateur user) {
        return Map.of("count", notificationService.unreadCount(user.getId()));
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markRead(@AuthenticationPrincipal Utilisateur user, @PathVariable Long id) {
        return notificationService.markRead(user.getId(), id);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@AuthenticationPrincipal Utilisateur user) {
        notificationService.markAllRead(user.getId());
    }
}
