package com.lamaisonorientale.user.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.UserToken;
import com.lamaisonorientale.user.domain.UserTokenType;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UserTokenRepository;

@ExtendWith(MockitoExtension.class)
class AgentInvitationServiceTest {

    @Mock
    private UserTokenRepository userTokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AgentInvitationService agentInvitationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(agentInvitationService, "frontendUrl", "http://localhost:3000");
    }

    @Test
    void placeholderPasswordHash_ShouldReturnEncodedValue() {
        when(passwordEncoder.encode(any())).thenReturn("encoded-placeholder");

        String hash = agentInvitationService.placeholderPasswordHash();

        assertThat(hash).isEqualTo("encoded-placeholder");
        verify(passwordEncoder).encode(any());
    }

    @Test
    void sendInvitation_ShouldCreateTokenAndSendEmail() {
        Utilisateur agent = Utilisateur.builder()
                .id(2L)
                .email("agent@test.local")
                .prenom("Marie")
                .nom("Agent")
                .role(RoleUtilisateur.AGENT)
                .actif(false)
                .build();

        when(userTokenRepository.save(any(UserToken.class))).thenAnswer(inv -> inv.getArgument(0));

        agentInvitationService.sendInvitation(agent);

        ArgumentCaptor<UserToken> tokenCaptor = ArgumentCaptor.forClass(UserToken.class);
        verify(userTokenRepository).save(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getType()).isEqualTo(UserTokenType.INVITE_AGENT);
        assertThat(tokenCaptor.getValue().getUtilisateur()).isEqualTo(agent);

        verify(emailService)
                .sendAgentInviteEmail(eq("agent@test.local"), eq("Marie Agent"), any(String.class));
    }
}
