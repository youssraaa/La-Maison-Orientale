package com.lamaisonorientale.commande.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
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

import com.lamaisonorientale.commande.domain.Commande;
import com.lamaisonorientale.commande.domain.ModeCommande;
import com.lamaisonorientale.commande.domain.ModePaiement;
import com.lamaisonorientale.commande.domain.StatutCommande;
import com.lamaisonorientale.commande.dto.PublicCommandeDetailDto;
import com.lamaisonorientale.commande.dto.SubmitCommandeRequest;
import com.lamaisonorientale.commande.infrastructure.CommandeRepository;
import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
import com.lamaisonorientale.menu.infrastructure.PlatRepository;
import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class CommandeServiceTest {

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private PlatRepository platRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private RestaurantSettingsService restaurantSettingsService;

    @Mock
    private DeliveryZoneService deliveryZoneService;

    @InjectMocks
    private CommandeService commandeService;

    private Commande commande;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(commandeService, "frontendUrl", "http://localhost:3000");

        commande = new Commande();
        commande.setReference("CMD-001");
        commande.setModeCommande(ModeCommande.EMPORTER);
        commande.setStatut(StatutCommande.CONFIRMEE);
        commande.setNomClient("Dupont");
        commande.setEmailClient("client@test.local");
        commande.setTelephoneClient("0498672262");
        commande.setModePaiement(ModePaiement.CARTE_SUR_PLACE);
        commande.setTotal(BigDecimal.valueOf(25.00));
        commande.setGestionToken("token-cmd");
        ReflectionTestUtils.setField(commande, "id", 10L);
        ReflectionTestUtils.setField(commande, "createdAt", Instant.parse("2026-08-01T10:00:00Z"));
    }

    @Test
    void getByToken_ShouldReturnPublicDetail() {
        when(commandeRepository.findByGestionToken("token-cmd")).thenReturn(Optional.of(commande));

        PublicCommandeDetailDto detail = commandeService.getByToken("token-cmd");

        assertThat(detail.id()).isEqualTo(10L);
        assertThat(detail.reference()).isEqualTo("CMD-001");
        assertThat(detail.statut()).isEqualTo("CONFIRMEE");
    }

    @Test
    void getByToken_ShouldThrow_WhenTokenUnknown() {
        when(commandeRepository.findByGestionToken("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandeService.getByToken("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("introuvable");
    }

    @Test
    void submit_ShouldRejectEmptyCart() {
        SubmitCommandeRequest request = new SubmitCommandeRequest(
                "EMPORTER",
                "Dupont",
                "client@test.local",
                "0498672262",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                List.of());

        assertThatThrownBy(() -> commandeService.submit(request))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
