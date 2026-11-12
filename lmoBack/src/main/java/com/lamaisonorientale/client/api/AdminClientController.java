package com.lamaisonorientale.client.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.client.application.AdminClientService;
import com.lamaisonorientale.client.dto.AdminClientDetailDto;
import com.lamaisonorientale.client.dto.AdminClientDto;

@RestController
@RequestMapping("/api/admin/clients")
public class AdminClientController {

    private final AdminClientService adminClientService;

    public AdminClientController(AdminClientService adminClientService) {
        this.adminClientService = adminClientService;
    }

    @GetMapping
    public List<AdminClientDto> list() {
        return adminClientService.listClients();
    }

    @GetMapping("/detail")
    public AdminClientDetailDto detail(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String telephone,
            @RequestParam(required = false) String nom) {
        return adminClientService.getClientDetail(email, telephone, nom);
    }
}
