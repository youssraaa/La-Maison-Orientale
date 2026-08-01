package com.lamaisonorientale.reservation.api;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.reservation.application.ReservationService;
import com.lamaisonorientale.reservation.dto.AvailabilityResponseDto;
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

    @GetMapping("/availability")
    public AvailabilityResponseDto availability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "2") int nbPersonnes) {
        return reservationService.getAvailability(date, nbPersonnes);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponseDto submit(@Valid @RequestBody ReservationRequestDto request) {
        return reservationService.submit(request);
    }
}
