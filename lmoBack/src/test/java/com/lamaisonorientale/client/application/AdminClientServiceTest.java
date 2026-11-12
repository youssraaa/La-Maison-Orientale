package com.lamaisonorientale.client.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.client.dto.AdminClientDetailDto;
import com.lamaisonorientale.client.dto.AdminClientDto;
import com.lamaisonorientale.commande.infrastructure.CommandeRepository;
import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.domain.StatutDemande;
import com.lamaisonorientale.demande.domain.TypeDemande;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class AdminClientServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private DemandeClientRepository demandeClientRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private AdminClientService adminClientService;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        reservation = new Reservation();
        reservation.setDateReservation(LocalDate.of(2026, 9, 1));
        reservation.setHeureReservation(LocalTime.of(19, 0));
        reservation.setNbPersonnes(2);
        reservation.setNomClient("Dupont");
        reservation.setEmailClient("client@test.local");
        reservation.setTelephoneClient("0498672262");
        reservation.setStatut(StatutReservation.CONFIRMEE);
        ReflectionTestUtils.setField(reservation, "id", 1L);
        ReflectionTestUtils.setField(reservation, "createdAt", Instant.parse("2026-08-01T10:00:00Z"));
    }

    @Test
    void listClients_ShouldAggregateRegisteredAccountsOnly() {
        Utilisateur client = new Utilisateur();
        client.setEmail("client@test.local");
        client.setNom("Dupont");
        client.setTelephone("0498672262");
        client.setRole(RoleUtilisateur.CLIENT);
        ReflectionTestUtils.setField(client, "createdAt", Instant.parse("2026-07-01T10:00:00Z"));

        DemandeClient message = new DemandeClient();
        message.setTypeDemande(TypeDemande.CONTACT);
        message.setNom("Dupont");
        message.setEmail("client@test.local");
        message.setTelephone("0498672262");
        message.setSujet("Question");
        message.setMessage("Message de test");
        message.setStatut(StatutDemande.NOUVELLE);
        ReflectionTestUtils.setField(message, "id", 10L);
        ReflectionTestUtils.setField(message, "createdAt", Instant.parse("2026-08-02T10:00:00Z"));

        when(utilisateurRepository.findByRoleOrderByNomAscEmailAsc(RoleUtilisateur.CLIENT)).thenReturn(List.of(client));
        when(reservationRepository.findAllByOrderByDateReservationDescHeureReservationAsc())
                .thenReturn(List.of(reservation));
        when(commandeRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(demandeClientRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(message));

        List<AdminClientDto> clients = adminClientService.listClients();

        assertThat(clients).hasSize(1);
        assertThat(clients.get(0).nom()).isEqualTo("Dupont");
        assertThat(clients.get(0).nbReservations()).isEqualTo(1);
        assertThat(clients.get(0).nbMessages()).isEqualTo(1);
        assertThat(clients.get(0).datePremiereActivite()).isEqualTo(Instant.parse("2026-08-01T10:00:00Z"));
        assertThat(clients.get(0).derniereActivite()).isEqualTo(Instant.parse("2026-08-02T10:00:00Z"));
    }

    @Test
    void listClients_ShouldExcludeVisitorWithoutAccount() {
        when(utilisateurRepository.findByRoleOrderByNomAscEmailAsc(RoleUtilisateur.CLIENT)).thenReturn(List.of());
        when(reservationRepository.findAllByOrderByDateReservationDescHeureReservationAsc())
                .thenReturn(List.of(reservation));
        when(commandeRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(demandeClientRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());

        assertThat(adminClientService.listClients()).isEmpty();
    }

    @Test
    void getClientDetail_ShouldReturnReservationsByEmail() {
        when(reservationRepository.findByEmailClientIgnoreCaseOrderByCreatedAtDesc("client@test.local"))
                .thenReturn(List.of(reservation));
        when(demandeClientRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc("client@test.local"))
                .thenReturn(List.of());

        AdminClientDetailDto detail = adminClientService.getClientDetail("client@test.local", null, null);

        assertThat(detail.email()).isEqualTo("client@test.local");
        assertThat(detail.reservations()).hasSize(1);
        assertThat(detail.reservations().get(0).statut()).isEqualTo("CONFIRMEE");
    }

    @Test
    void getClientDetail_ShouldThrow_WhenNoLookupCriteria() {
        assertThatThrownBy(() -> adminClientService.getClientDetail(null, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Indiquez un e-mail");
    }
}