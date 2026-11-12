package com.lamaisonorientale.reservation.api;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.reservation.application.ReservationService;
import com.lamaisonorientale.reservation.dto.AvailabilityResponseDto;
import com.lamaisonorientale.reservation.dto.ModifyReservationRequest;
import com.lamaisonorientale.reservation.dto.PublicReservationDetailDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/public/reservations/manage")
public class PublicReservationManageController {

    private final ReservationService reservationService;

    public PublicReservationManageController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/{token}")
    public PublicReservationDetailDto get(@PathVariable String token) {
        return reservationService.getByToken(token);
    }

    @GetMapping("/{token}/availability")
    public AvailabilityResponseDto availability(
            @PathVariable String token,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "2") int nbPersonnes) {
        return reservationService.getAvailabilityForToken(token, date, nbPersonnes);
    }

    @PutMapping("/{token}")
    public PublicReservationDetailDto modify(
            @PathVariable String token, @Valid @RequestBody ModifyReservationRequest request) {
        return reservationService.modifyByToken(token, request);
    }

    @DeleteMapping("/{token}")
    @ResponseStatus(HttpStatus.OK)
    public PublicReservationDetailDto cancel(@PathVariable String token) {
        return reservationService.cancelByToken(token);
    }
}
