package com.lamaisonorientale.reservation.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.reservation.application.ReservationService;
import com.lamaisonorientale.reservation.dto.ReservationRequestDto;
import com.lamaisonorientale.reservation.dto.ReservationResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/public/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponseDto submit(@Valid @RequestBody ReservationRequestDto request) {
        return reservationService.submit(request);
    }
}
