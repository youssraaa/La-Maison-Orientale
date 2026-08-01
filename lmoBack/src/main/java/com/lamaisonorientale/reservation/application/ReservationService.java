package com.lamaisonorientale.reservation.application;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.email.EmailDeliveryException;
import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.dto.AvailabilityResponseDto;
import com.lamaisonorientale.reservation.dto.AvailabilityResponseDto.SlotAvailabilityDto;
import com.lamaisonorientale.reservation.dto.ReservationRequestDto;
import com.lamaisonorientale.reservation.dto.ReservationResponseDto;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    private static final Set<DayOfWeek> CLOSED_DAYS = EnumSet.of(DayOfWeek.MONDAY);
    private static final LocalTime OPEN_TIME = LocalTime.of(12, 0);
    private static final LocalTime LAST_SLOT = LocalTime.of(22, 30);
    private static final int SLOT_MINUTES = 30;
    private static final int MAX_COVERS_PER_SLOT = 20;
    /** Aligné avec le front (DATE_HORIZON_DAYS). */
    private static final int MAX_BOOKING_DAYS = 60;

    private final ReservationRepository repository;
    private final EmailService emailService;

    public ReservationService(ReservationRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponseDto getAvailability(LocalDate date, int nbPersonnes) {
        if (nbPersonnes < 1) {
            nbPersonnes = 1;
        }
        if (CLOSED_DAYS.contains(date.getDayOfWeek()) || isOutsideBookingHorizon(date)) {
            return new AvailabilityResponseDto(date, true, MAX_COVERS_PER_SLOT, List.of());
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        List<SlotAvailabilityDto> slots = new ArrayList<>();

        for (LocalTime slot = OPEN_TIME; !slot.isAfter(LAST_SLOT); slot = slot.plusMinutes(SLOT_MINUTES)) {
            boolean past = date.isEqual(today) && !slot.isAfter(now.plusMinutes(30));
            Integer reservedRaw = repository.sumActiveCovers(date, slot);
            int reserved = reservedRaw == null ? 0 : Math.max(0, reservedRaw);
            int remaining = Math.max(0, MAX_COVERS_PER_SLOT - reserved);
            boolean available = !past && remaining >= nbPersonnes;
            String label = past ? "Passé" : (available ? "Disponible" : "Complet");
            slots.add(new SlotAvailabilityDto(slot.toString().substring(0, 5), available, remaining, label));
        }

        return new AvailabilityResponseDto(date, false, MAX_COVERS_PER_SLOT, slots);
    }

    @Transactional(noRollbackFor = EmailDeliveryException.class)
    public ReservationResponseDto submit(ReservationRequestDto request) {
        validateAvailability(request.date(), request.heure(), request.nbPersonnes());

        Reservation reservation = new Reservation();
        reservation.setNomClient(request.nom().trim());
        reservation.setTelephoneClient(request.telephone().trim());
        reservation.setEmailClient(trimToNull(request.email()));
        reservation.setDateReservation(request.date());
        reservation.setHeureReservation(request.heure());
        reservation.setNbPersonnes(request.nbPersonnes());
        reservation.setCommentaire(trimToNull(request.commentaire()));
        reservation.setStatut(StatutReservation.CONFIRMEE);

        Reservation saved = repository.save(reservation);

        // La réservation est déjà confirmée en base : un échec mail ne doit pas
        // renvoyer une erreur au client (sinon UX contradictoire + double booking).
        try {
            emailService.sendReservationNotificationToRestaurant(
                    saved.getId(),
                    saved.getNomClient(),
                    saved.getEmailClient(),
                    saved.getTelephoneClient(),
                    saved.getDateReservation(),
                    saved.getHeureReservation(),
                    saved.getNbPersonnes(),
                    saved.getCommentaire(),
                    saved.getCreatedAt());
        } catch (EmailDeliveryException ex) {
            log.warn(
                    "Notification restaurant non envoyée pour réservation #{} : {}",
                    saved.getId(),
                    ex.getMessage());
        }

        try {
            emailService.sendReservationAcknowledgementToClient(
                    saved.getEmailClient(),
                    saved.getNomClient(),
                    saved.getDateReservation(),
                    saved.getHeureReservation(),
                    saved.getNbPersonnes());
        } catch (EmailDeliveryException ex) {
            log.warn(
                    "Accusé client non envoyé pour réservation #{} : {}",
                    saved.getId(),
                    ex.getMessage());
        }

        return new ReservationResponseDto(
                saved.getId(),
                "Votre table est réservée. À bientôt à La Maison Orientale !",
                saved.getDateReservation(),
                saved.getHeureReservation(),
                saved.getNbPersonnes(),
                saved.getStatut().name(),
                saved.getCreatedAt());
    }

    private void validateAvailability(LocalDate date, LocalTime heure, int nbPersonnes) {
        if (CLOSED_DAYS.contains(date.getDayOfWeek())) {
            throw new IllegalArgumentException("Le restaurant est fermé ce jour-là.");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La date ne peut pas être dans le passé.");
        }
        if (isOutsideBookingHorizon(date)) {
            throw new IllegalArgumentException(
                    "Les réservations sont possibles jusqu'à " + MAX_BOOKING_DAYS + " jours à l'avance.");
        }
        if (heure.isBefore(OPEN_TIME) || heure.isAfter(LAST_SLOT)) {
            throw new IllegalArgumentException("Ce créneau n'est pas dans les horaires d'ouverture.");
        }
        int minutes = heure.getHour() * 60 + heure.getMinute();
        int openMinutes = OPEN_TIME.getHour() * 60 + OPEN_TIME.getMinute();
        if ((minutes - openMinutes) % SLOT_MINUTES != 0) {
            throw new IllegalArgumentException("Ce créneau n'est pas proposé.");
        }
        if (date.isEqual(LocalDate.now()) && !heure.isAfter(LocalTime.now().plusMinutes(30))) {
            throw new IllegalArgumentException("Ce créneau n'est plus disponible.");
        }

        Integer reservedRaw = repository.sumActiveCovers(date, heure);
        int reserved = reservedRaw == null ? 0 : Math.max(0, reservedRaw);
        if (reserved + nbPersonnes > MAX_COVERS_PER_SLOT) {
            throw new IllegalArgumentException(
                    "Ce créneau est complet. Choisissez un autre horaire.");
        }
    }

    private static boolean isOutsideBookingHorizon(LocalDate date) {
        return date.isAfter(LocalDate.now().plusDays(MAX_BOOKING_DAYS - 1L));
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
