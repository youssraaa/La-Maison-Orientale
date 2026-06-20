package com.lamaisonorientale.reservation.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.dto.ReservationRequestDto;
import com.lamaisonorientale.reservation.dto.ReservationResponseDto;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;

@Service
public class ReservationService {

    private final ReservationRepository repository;

    public ReservationService(ReservationRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ReservationResponseDto submit(ReservationRequestDto request) {
        Reservation reservation = new Reservation();
        reservation.setNomClient(request.nom().trim());
        reservation.setTelephoneClient(request.telephone().trim());
        reservation.setEmailClient(trimToNull(request.email()));
        reservation.setDateReservation(request.date());
        reservation.setHeureReservation(request.heure());
        reservation.setNbPersonnes(request.nbPersonnes());
        reservation.setCommentaire(trimToNull(request.commentaire()));
        reservation.setStatut(StatutReservation.EN_ATTENTE);

        Reservation saved = repository.save(reservation);

        return new ReservationResponseDto(
                saved.getId(),
                "Votre demande de réservation a bien été enregistrée. "
                        + "Nous vous recontacterons rapidement pour la confirmer.",
                saved.getDateReservation(),
                saved.getHeureReservation(),
                saved.getNbPersonnes(),
                saved.getStatut().name(),
                saved.getCreatedAt());
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
