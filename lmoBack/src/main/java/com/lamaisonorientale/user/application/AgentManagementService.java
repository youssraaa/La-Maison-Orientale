package com.lamaisonorientale.user.application;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.UserTokenType;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.AgentResponseDto;
import com.lamaisonorientale.user.dto.CreateAgentRequest;
import com.lamaisonorientale.user.dto.UpdateAgentRequest;
import com.lamaisonorientale.user.infrastructure.UserTokenRepository;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@Service
public class AgentManagementService {

    private final UtilisateurRepository utilisateurRepository;
    private final UserTokenRepository userTokenRepository;
    private final AgentInvitationService agentInvitationService;

    public AgentManagementService(
            UtilisateurRepository utilisateurRepository,
            UserTokenRepository userTokenRepository,
            AgentInvitationService agentInvitationService) {
        this.utilisateurRepository = utilisateurRepository;
        this.userTokenRepository = userTokenRepository;
        this.agentInvitationService = agentInvitationService;
    }

    @Transactional(readOnly = true)
    public List<AgentResponseDto> listAgents() {
        return utilisateurRepository.findByRoleOrderByNomAscEmailAsc(RoleUtilisateur.AGENT).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AgentResponseDto create(CreateAgentRequest request) {
        if (utilisateurRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet e-mail.");
        }

        Utilisateur agent = Utilisateur.builder()
                .email(request.email().trim().toLowerCase())
                .motDePasseHash(agentInvitationService.placeholderPasswordHash())
                .prenom(request.prenom().trim())
                .nom(request.nom().trim())
                .role(RoleUtilisateur.AGENT)
                .actif(false)
                .createdAt(Instant.now())
                .build();

        agent = utilisateurRepository.save(agent);
        agentInvitationService.sendInvitation(agent);
        return toDto(agent);
    }

    @Transactional
    public AgentResponseDto update(Long id, UpdateAgentRequest request) {
        Utilisateur agent = getAgent(id);

        if (utilisateurRepository.existsByEmailIgnoreCaseAndIdNot(request.email(), id)) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet e-mail.");
        }

        agent.setPrenom(request.prenom().trim());
        agent.setNom(request.nom().trim());
        agent.setEmail(request.email().trim().toLowerCase());

        return toDto(utilisateurRepository.save(agent));
    }

    @Transactional
    public void delete(Long id) {
        utilisateurRepository.delete(getAgent(id));
    }

    @Transactional
    public void resendInvitation(Long id) {
        Utilisateur agent = getAgent(id);
        if (agent.isActif()) {
            throw new IllegalArgumentException("Cet agent est déjà actif.");
        }
        agentInvitationService.sendInvitation(agent);
    }

    @Transactional
    public void sendPasswordReset(Long id) {
        Utilisateur agent = getAgent(id);
        if (!agent.isActif()) {
            throw new IllegalArgumentException("Seuls les agents actifs peuvent recevoir une réinitialisation.");
        }
        agentInvitationService.sendPasswordReset(agent);
    }

    private Utilisateur getAgent(Long id) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agent introuvable."));
        if (user.getRole() != RoleUtilisateur.AGENT) {
            throw new IllegalArgumentException("Cet utilisateur n'est pas un agent.");
        }
        return user;
    }

    private AgentResponseDto toDto(Utilisateur agent) {
        boolean invitationEnAttente = !agent.isActif()
                && userTokenRepository.existsByUtilisateurIdAndTypeAndUsedAtIsNullAndExpiresAtAfter(
                        agent.getId(), UserTokenType.INVITE_AGENT, Instant.now());

        return new AgentResponseDto(
                agent.getId(),
                agent.getPrenom(),
                agent.getNom(),
                agent.getEmail(),
                agent.getRole().name(),
                agent.isActif(),
                invitationEnAttente,
                agent.getCreatedAt());
    }
}
