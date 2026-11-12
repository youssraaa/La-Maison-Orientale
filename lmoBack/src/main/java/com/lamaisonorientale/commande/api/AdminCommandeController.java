package com.lamaisonorientale.commande.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.commande.application.CommandeService;
import com.lamaisonorientale.commande.dto.AdminCommandeDto;
import com.lamaisonorientale.commande.dto.UpdateCommandeStatutRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/commandes")
public class AdminCommandeController {

    private final CommandeService commandeService;

    public AdminCommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    @GetMapping
    public List<AdminCommandeDto> list(@RequestParam(required = false) String date) {
        return commandeService.listAllAdmin(date);
    }

    @GetMapping("/{id}")
    public AdminCommandeDto getById(@PathVariable Long id) {
        return commandeService.getAdminById(id);
    }

    @PatchMapping("/{id}/statut")
    public AdminCommandeDto updateStatut(
            @PathVariable Long id, @Valid @RequestBody UpdateCommandeStatutRequest request) {
        return commandeService.updateStatut(id, request.statut());
    }
}
