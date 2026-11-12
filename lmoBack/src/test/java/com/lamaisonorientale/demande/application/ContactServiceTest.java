package com.lamaisonorientale.demande.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.domain.StatutDemande;
import com.lamaisonorientale.demande.domain.TypeDemande;
import com.lamaisonorientale.demande.dto.ContactRequestDto;
import com.lamaisonorientale.demande.dto.ContactResponseDto;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.notification.domain.NotificationType;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private DemandeClientRepository repository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ContactService contactService;

    private ContactRequestDto request;

    @BeforeEach
    void setUp() {
        request = new ContactRequestDto(
                "Dupont",
                "client@test.local",
                "0498672262",
                "Renseignements",
                "Bonjour, j'aimerais des informations sur vos menus.");
    }

    @Test
    void submit_ShouldPersistDemandeAndNotify() {
        ArgumentCaptor<DemandeClient> captor = ArgumentCaptor.forClass(DemandeClient.class);
        when(repository.save(any(DemandeClient.class))).thenAnswer(invocation -> {
            DemandeClient demande = invocation.getArgument(0);
            ReflectionTestUtils.setField(demande, "id", 12L);
            ReflectionTestUtils.setField(demande, "createdAt", Instant.parse("2026-08-01T10:00:00Z"));
            return demande;
        });

        ContactResponseDto response = contactService.submit(request);

        verify(repository).save(captor.capture());
        DemandeClient saved = captor.getValue();
        assertThat(saved.getTypeDemande()).isEqualTo(TypeDemande.CONTACT);
        assertThat(saved.getNom()).isEqualTo("Dupont");
        assertThat(saved.getEmail()).isEqualTo("client@test.local");
        assertThat(saved.getTelephone()).isEqualTo("0498672262");
        assertThat(saved.getSujet()).isEqualTo("Renseignements");
        assertThat(saved.getStatut()).isEqualTo(StatutDemande.NOUVELLE);

        verify(emailService).sendContactNotificationToRestaurant(
                eq(12L),
                eq("Dupont"),
                eq("client@test.local"),
                eq("0498672262"),
                eq("Renseignements"),
                eq("Bonjour, j'aimerais des informations sur vos menus."),
                eq(Instant.parse("2026-08-01T10:00:00Z")));
        verify(emailService).sendContactAcknowledgementToClient(
                eq("client@test.local"),
                eq("Dupont"),
                eq("Renseignements"),
                eq("Bonjour, j'aimerais des informations sur vos menus."));
        verify(notificationService).notifyStaff(
                eq(NotificationType.NOUVEAU_MESSAGE),
                eq("Nouveau message contact"),
                eq("Dupont · Renseignements"),
                eq("/admin/messages"));

        assertThat(response.id()).isEqualTo(12L);
        assertThat(response.message()).contains("Votre message a bien été envoyé");
        assertThat(response.createdAt()).isEqualTo(Instant.parse("2026-08-01T10:00:00Z"));
    }
}
