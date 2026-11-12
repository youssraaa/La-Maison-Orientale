package com.lamaisonorientale.user.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.UserTokenType;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.AgentResponseDto;
import com.lamaisonorientale.user.dto.CreateAgentRequest;
import com.lamaisonorientale.user.infrastructure.UserTokenRepository;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@ExtendWith(MockitoExtension.class)
class AgentManagementServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private UserTokenRepository userTokenRepository;

    @Mock
    private AgentInvitationService agentInvitationService;

    @InjectMocks
    private AgentManagementService agentManagementService;

    private Utilisateur agent;

    @BeforeEach
    void setUp() {
        agent = Utilisateur.builder()
                .id(2L)
                .email("agent@test.local")
                .motDePasseHash("hash")
                .prenom("Marie")
                .nom("Agent")
                .role(RoleUtilisateur.AGENT)
                .actif(true)
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();
    }

    @Test
    void listAgents_ShouldReturnAgentDtos() {
        when(utilisateurRepository.findByRoleOrderByNomAscEmailAsc(RoleUtilisateur.AGENT))
                .thenReturn(List.of(agent));

        List<AgentResponseDto> agents = agentManagementService.listAgents();

        assertThat(agents).hasSize(1);
        assertThat(agents.get(0).email()).isEqualTo("agent@test.local");
        assertThat(agents.get(0).actif()).isTrue();
    }

    @Test
    void create_ShouldSaveAgentAndSendInvitation() {
        when(utilisateurRepository.existsByEmailIgnoreCase("nouveau.agent@test.local"))
                .thenReturn(false);
        when(agentInvitationService.placeholderPasswordHash()).thenReturn("placeholder-hash");
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(inv -> {
            Utilisateur saved = inv.getArgument(0);
            saved.setId(3L);
            return saved;
        });
        when(userTokenRepository.existsByUtilisateurIdAndTypeAndUsedAtIsNullAndExpiresAtAfter(
                        eq(3L), eq(UserTokenType.INVITE_AGENT), any(Instant.class)))
                .thenReturn(true);

        AgentResponseDto created = agentManagementService.create(
                new CreateAgentRequest("Paul", "Nouveau", "nouveau.agent@test.local"));

        assertThat(created.email()).isEqualTo("nouveau.agent@test.local");
        assertThat(created.actif()).isFalse();
        verify(agentInvitationService).sendInvitation(any(Utilisateur.class));
    }

    @Test
    void delete_ShouldRemoveAgent() {
        when(utilisateurRepository.findById(2L)).thenReturn(Optional.of(agent));

        agentManagementService.delete(2L);

        verify(utilisateurRepository).delete(agent);
    }

    @Test
    void delete_ShouldThrow_WhenUserIsNotAgent() {
        Utilisateur admin = Utilisateur.builder()
                .id(1L)
                .email("admin@test.local")
                .role(RoleUtilisateur.ADMIN)
                .build();
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> agentManagementService.delete(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("n'est pas un agent");
    }
}
