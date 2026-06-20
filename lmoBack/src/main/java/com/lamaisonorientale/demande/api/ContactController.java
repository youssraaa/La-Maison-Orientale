package com.lamaisonorientale.demande.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.demande.application.ContactService;
import com.lamaisonorientale.demande.dto.ContactRequestDto;
import com.lamaisonorientale.demande.dto.ContactResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/public/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponseDto submit(@Valid @RequestBody ContactRequestDto request) {
        return contactService.submit(request);
    }
}
