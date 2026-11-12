package com.lamaisonorientale.demande.application;

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

import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.domain.StatutDemande;
import com.lamaisonorientale.demande.domain.TypeDemande;
import com.lamaisonorientale.demande.dto.AdminMessageDto;
import com.lamaisonorientale.demande.dto.ReplyMessageRequest;
import com.lamaisonorientale.demande.dto.UpdateDemandeStatutRequest;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.notification.application.NotificationService;

@ExtendWith(MockitoExtension.class)
class AdminMessageServiceTest {

    @Mock
    private DemandeClientRepository demandeClientRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminMessageService adminMessageService;

    private DemandeClient demande;

    @BeforeEach
    void setUp() {
        demande = new DemandeClient();
        demande.setTypeDemande(TypeDemande.CONTACT);
        demande.setNom("Dupont");
        demande.setEmail("client@test.local");
        demande.setTelephone("0498672262");
        demande.setSujet("Renseignements");
        demande.setMessage("Bonjour, j'aimerais des informations.");
        demande.setStatut(StatutDemande.NOUVELLE);
        ReflectionTestUtils.setField(demande, "id", 1L);
        ReflectionTestUtils.setField(demande, "createdAt", Instant.parse("2026-08-01T10:00:00Z"));
    }

    @Test
    void list_ShouldFilterByStatut() {
        DemandeClient traitee = new DemandeClient();
        traitee.setTypeDemande(TypeDemande.CONTACT);
        traitee.setNom("Martin");
        traitee.setEmail("martin@test.local");
        traitee.setMessage("Autre message");
        traitee.setStatut(StatutDemande.TRAITEE);
        ReflectionTestUtils.setField(traitee, "id", 2L);
        ReflectionTestUtils.setField(traitee, "createdAt", Instant.parse("2026-08-02T10:00:00Z"));

        when(demandeClientRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(traitee, demande));

        List<AdminMessageDto> result = adminMessageService.list("NOUVELLE");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).nom()).isEqualTo("Dupont");
        assertThat(result.get(0).statut()).isEqualTo("NOUVELLE");
    }

    @Test
    void updateStatut_ShouldPersistNewStatut() {
        when(demandeClientRepository.findById(1L)).thenReturn(Optional.of(demande));
        when(demandeClientRepository.save(any(DemandeClient.class))).thenAnswer(inv -> inv.getArgument(0));

        AdminMessageDto updated =
                adminMessageService.updateStatut(1L, new UpdateDemandeStatutRequest("TRAITEE"));

        assertThat(updated.statut()).isEqualTo("TRAITEE");
        assertThat(demande.getStatut()).isEqualTo(StatutDemande.TRAITEE);
    }

    @Test
    void updateStatut_ShouldRejectInvalidStatut() {
        when(demandeClientRepository.findById(1L)).thenReturn(Optional.of(demande));

        assertThatThrownBy(() -> adminMessageService.updateStatut(1L, new UpdateDemandeStatutRequest("INVALIDE")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Statut de message invalide");
    }

    @Test
    void reply_ShouldSendEmailAndMarkTraitee() {
        when(demandeClientRepository.findById(1L)).thenReturn(Optional.of(demande));
        when(demandeClientRepository.save(any(DemandeClient.class))).thenAnswer(inv -> inv.getArgument(0));

        AdminMessageDto replied =
                adminMessageService.reply(1L, new ReplyMessageRequest("Merci pour votre message."));

        verify(emailService).sendContactReplyToClient(
                "client@test.local",
                "Dupont",
                "Renseignements",
                "Bonjour, j'aimerais des informations.",
                "Merci pour votre message.");
        assertThat(replied.statut()).isEqualTo("TRAITEE");
        assertThat(replied.reponseClient()).isEqualTo("Merci pour votre message.");
        assertThat(demande.getStatut()).isEqualTo(StatutDemande.TRAITEE);
        assertThat(demande.getReponseClient()).isEqualTo("Merci pour votre message.");
    }

    @Test
    void reply_ShouldRejectWhenNoEmail() {
        demande.setEmail(null);
        when(demandeClientRepository.findById(1L)).thenReturn(Optional.of(demande));

        assertThatThrownBy(() -> adminMessageService.reply(1L, new ReplyMessageRequest("Réponse")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Impossible de répondre");
    }
}
