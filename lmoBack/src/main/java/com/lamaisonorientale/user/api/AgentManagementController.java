package com.lamaisonorientale.user.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.user.application.AgentManagementService;
import com.lamaisonorientale.user.dto.AgentResponseDto;
import com.lamaisonorientale.user.dto.CreateAgentRequest;
import com.lamaisonorientale.user.dto.UpdateAgentRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/agents")
public class AgentManagementController {

    private final AgentManagementService agentManagementService;

    public AgentManagementController(AgentManagementService agentManagementService) {
        this.agentManagementService = agentManagementService;
    }

    @GetMapping
    public List<AgentResponseDto> list() {
        return agentManagementService.listAgents();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgentResponseDto create(@Valid @RequestBody CreateAgentRequest request) {
        return agentManagementService.create(request);
    }

    @PutMapping("/{id}")
    public AgentResponseDto update(
            @PathVariable Long id, @Valid @RequestBody UpdateAgentRequest request) {
        return agentManagementService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        agentManagementService.delete(id);
    }

    @PostMapping("/{id}/resend-invite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resendInvite(@PathVariable Long id) {
        agentManagementService.resendInvitation(id);
    }

    @PostMapping("/{id}/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@PathVariable Long id) {
        agentManagementService.sendPasswordReset(id);
    }
}
