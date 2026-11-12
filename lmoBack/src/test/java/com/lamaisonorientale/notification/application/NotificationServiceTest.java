package com.lamaisonorientale.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.notification.domain.Notification;
import com.lamaisonorientale.notification.domain.NotificationType;
import com.lamaisonorientale.notification.dto.NotificationDto;
import com.lamaisonorientale.notification.infrastructure.NotificationRepository;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;

    @BeforeEach
    void setUp() {
        notification = new Notification();
        notification.setUtilisateurId(1L);
        notification.setType(NotificationType.NOUVEAU_MESSAGE);
        notification.setTitre("Nouveau message contact");
        notification.setMessage("Dupont · Renseignements");
        notification.setLien("/admin/messages");
        notification.setLue(false);
        notification.setCreatedAt(Instant.parse("2026-08-01T10:00:00Z"));
        ReflectionTestUtils.setField(notification, "id", 10L);
    }

    @Test
    void listForUser_ShouldReturnMappedNotifications() {
        when(notificationRepository.findByUtilisateurIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(notification));

        List<NotificationDto> result = notificationService.listForUser(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(10L);
        assertThat(result.get(0).type()).isEqualTo("NOUVEAU_MESSAGE");
        assertThat(result.get(0).titre()).isEqualTo("Nouveau message contact");
        assertThat(result.get(0).message()).isEqualTo("Dupont · Renseignements");
        assertThat(result.get(0).lien()).isEqualTo("/admin/messages");
        assertThat(result.get(0).lue()).isFalse();
        assertThat(result.get(0).createdAt()).isEqualTo(Instant.parse("2026-08-01T10:00:00Z"));
    }

    @Test
    void unreadCount_ShouldDelegateToRepository() {
        when(notificationRepository.countByUtilisateurIdAndLueFalse(1L)).thenReturn(4L);

        long count = notificationService.unreadCount(1L);

        assertThat(count).isEqualTo(4L);
    }

    @Test
    void markRead_ShouldMarkOwnedNotificationAsRead() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationDto updated = notificationService.markRead(1L, 10L);

        assertThat(updated.lue()).isTrue();
        assertThat(notification.getLue()).isTrue();
        verify(notificationRepository).save(notification);
    }

    @Test
    void markRead_ShouldRejectForeignNotification() {
        notification.setUtilisateurId(99L);
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> notificationService.markRead(1L, 10L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Notification introuvable");
    }
}
