package com.lamaisonorientale.demande.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.demande.application.AdminMessageService;
import com.lamaisonorientale.demande.dto.AdminMessageDto;
import com.lamaisonorientale.demande.dto.InternalMessageNoteRequest;
import com.lamaisonorientale.demande.dto.ReplyMessageRequest;
import com.lamaisonorientale.demande.dto.UpdateDemandeStatutRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/messages")
public class AdminMessageController {

    private final AdminMessageService adminMessageService;

    public AdminMessageController(AdminMessageService adminMessageService) {
        this.adminMessageService = adminMessageService;
    }

    @GetMapping
    public List<AdminMessageDto> list(@RequestParam(required = false) String statut) {
        return adminMessageService.list(statut);
    }

    @PutMapping("/{id}/statut")
    public AdminMessageDto updateStatut(
            @PathVariable Long id, @Valid @RequestBody UpdateDemandeStatutRequest request) {
        return adminMessageService.updateStatut(id, request);
    }

    @PostMapping("/{id}/reply")
    public AdminMessageDto reply(@PathVariable Long id, @Valid @RequestBody ReplyMessageRequest request) {
        return adminMessageService.reply(id, request);
    }

    @PostMapping("/{id}/note")
    public AdminMessageDto addNote(@PathVariable Long id, @Valid @RequestBody InternalMessageNoteRequest request) {
        return adminMessageService.addInternalNote(id, request);
    }
}
