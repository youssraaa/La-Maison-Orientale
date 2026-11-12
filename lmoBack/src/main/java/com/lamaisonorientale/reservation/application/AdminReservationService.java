package com.lamaisonorientale.reservation.application;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.dto.AdminReservationDto;
import com.lamaisonorientale.reservation.dto.UpdateReservationStatutRequest;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;

@Service
public class AdminReservationService {

    private final ReservationRepository reservationRepository;

    public AdminReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminReservationDto> list(String statut, String date) {
        LocalDate filterDate = null;
        if (date != null && !date.isBlank()) {
            try {
                filterDate = LocalDate.parse(date.trim());
            } catch (Exception ignored) {
            }
        }

        List<Reservation> rows;
        if (filterDate != null) {
            rows = reservationRepository
                    .findByDateReservationOrderByHeureReservationAsc(filterDate);
        } else {
            rows = reservationRepository.findAllByOrderByDateReservationDescHeureReservationAsc();
        }

        return rows.stream()
                .filter(r -> statut == null || statut.isBlank()
                        || r.getStatut().name().equalsIgnoreCase(statut))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AdminReservationDto updateStatut(Long id, UpdateReservationStatutRequest request) {
        Reservation reservation = reservationRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable."));

        StatutReservation next;
        try {
            next = StatutReservation.valueOf(request.statut().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Statut de réservation invalide.");
        }

        reservation.setStatut(next);
        Reservation saved = reservationRepository.save(reservation);
        return toDto(saved);
    }

    private AdminReservationDto toDto(Reservation r) {
        return new AdminReservationDto(
                r.getId(),
                r.getDateReservation(),
                r.getHeureReservation(),
                r.getNbPersonnes(),
                r.getNomClient(),
                r.getEmailClient(),
                r.getTelephoneClient(),
                r.getCommentaire(),
                r.getStatut().name(),
                r.getCreatedAt());
    }
}


