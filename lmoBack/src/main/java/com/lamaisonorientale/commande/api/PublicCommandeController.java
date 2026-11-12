package com.lamaisonorientale.commande.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.commande.application.CommandeService;
import com.lamaisonorientale.commande.dto.CommandeResponseDto;
import com.lamaisonorientale.commande.dto.PublicCommandeDetailDto;
import com.lamaisonorientale.commande.dto.SubmitCommandeRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/public/commandes")
public class PublicCommandeController {

    private final CommandeService commandeService;

    public PublicCommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommandeResponseDto submit(@Valid @RequestBody SubmitCommandeRequest request) {
        return commandeService.submit(request);
    }

    @GetMapping("/manage/{token}")
    public PublicCommandeDetailDto get(@PathVariable String token) {
        return commandeService.getByToken(token);
    }

    @DeleteMapping("/manage/{token}")
    public PublicCommandeDetailDto cancel(@PathVariable String token) {
        return commandeService.cancelByToken(token);
    }
}
