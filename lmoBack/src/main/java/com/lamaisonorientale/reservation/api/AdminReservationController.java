package com.lamaisonorientale.reservation.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.reservation.application.AdminReservationService;
import com.lamaisonorientale.reservation.dto.AdminReservationDto;
import com.lamaisonorientale.reservation.dto.UpdateReservationStatutRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationController {

    private final AdminReservationService adminReservationService;

    public AdminReservationController(AdminReservationService adminReservationService) {
        this.adminReservationService = adminReservationService;
    }

    @GetMapping
    public List<AdminReservationDto> list(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String date) {
        return adminReservationService.list(statut, date);
    }

    @PutMapping("/{id}/statut")
    public AdminReservationDto updateStatut(
            @PathVariable Long id, @Valid @RequestBody UpdateReservationStatutRequest request) {
        return adminReservationService.updateStatut(id, request);
    }
}
