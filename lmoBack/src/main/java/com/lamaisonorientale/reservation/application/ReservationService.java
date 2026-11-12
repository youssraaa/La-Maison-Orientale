package com.lamaisonorientale.reservation.application;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.common.util.SecureTokenGenerator;

import com.lamaisonorientale.email.EmailDeliveryException;
import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.horaire.application.HoraireService;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.notification.domain.NotificationType;
import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;
import com.lamaisonorientale.reservation.dto.AvailabilityResponseDto;
import com.lamaisonorientale.reservation.dto.AvailabilityResponseDto.SlotAvailabilityDto;
import com.lamaisonorientale.reservation.dto.ModifyReservationRequest;
import com.lamaisonorientale.reservation.dto.PublicReservationDetailDto;
import com.lamaisonorientale.reservation.dto.ReservationRequestDto;
import com.lamaisonorientale.reservation.dto.ReservationResponseDto;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    private static final Set<StatutReservation> ACTIVE =
            EnumSet.of(StatutReservation.CONFIRMEE);

    private static final int DEFAULT_MODIFICATION_DEADLINE_HOURS = 2;

    private static final int DEFAULT_ONLINE_CANCELLATION_MAX = 10;

    private static final int DEFAULT_TABLE_DURATION_MINUTES = 90;

    private final ReservationRepository repository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final HoraireService horaireService;
    private final RestaurantSettingsService settingsService;
    private final UtilisateurRepository utilisateurRepository;

    @Value("${lmo.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public ReservationService(
            ReservationRepository repository,
            EmailService emailService,
            NotificationService notificationService,
            HoraireService horaireService,
            RestaurantSettingsService settingsService,
            UtilisateurRepository utilisateurRepository) {
        this.repository = repository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.horaireService = horaireService;
        this.settingsService = settingsService;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponseDto getAvailability(LocalDate date, int nbPersonnes) {
        return getAvailability(date, nbPersonnes, null);
    }

    @Transactional(readOnly = true)
    public AvailabilityResponseDto getAvailabilityForToken(String token, LocalDate date, int nbPersonnes) {
        Reservation reservation = repository
                .findByGestionToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable."));
        return getAvailability(date, nbPersonnes, reservation.getId());
    }

    @Transactional(readOnly = true)
    public AvailabilityResponseDto getAvailability(LocalDate date, int nbPersonnes, Long excludeReservationId) {
        if (nbPersonnes < 1) {
            nbPersonnes = 1;
        }
        int maxCovers = settingsService.getInt("capacite_max_creneau", 50);
        if (horaireService.isClosed(date) || isOutsideBookingHorizon(date)) {
            return new AvailabilityResponseDto(date, true, maxCovers, List.of());
        }

        var opening = horaireService.openingFor(date);
        if (opening.isEmpty()) {
            return new AvailabilityResponseDto(date, true, maxCovers, List.of());
        }

        int slotMinutes = settingsService.getInt("duree_creneau_minutes", 30);
        int tableDurationMinutes = settingsService.getInt("duree_table_minutes", DEFAULT_TABLE_DURATION_MINUTES);
        LocalTime openTime = opening.get().open();
        LocalTime lastSlot = opening.get().close();

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        List<SlotAvailabilityDto> slots = new ArrayList<>();
        List<Reservation> dayReservations =
                repository.findByDateReservationAndStatutInOrderByHeureReservationAsc(date, ACTIVE);

        for (LocalTime slot = openTime; !slot.isAfter(lastSlot); slot = slot.plusMinutes(slotMinutes)) {
            boolean past = date.isEqual(today) && !slot.isAfter(now.plusMinutes(30));
            int remaining = remainingCoversForBookingStart(
                    slot, nbPersonnes, excludeReservationId, dayReservations, maxCovers, slotMinutes, tableDurationMinutes);
            boolean available = !past && remaining >= nbPersonnes;
            String label = past ? "Passé" : (available ? "Disponible" : "Complet");
            slots.add(new SlotAvailabilityDto(slot.toString().substring(0, 5), available, remaining, label));
        }

        return new AvailabilityResponseDto(date, false, maxCovers, slots);
    }

    @Transactional(noRollbackFor = EmailDeliveryException.class)
    public ReservationResponseDto submit(ReservationRequestDto request) {
        validateOnlinePartySize(request.nbPersonnes(), null);
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
        reservation.setGestionToken(SecureTokenGenerator.newToken());
        reservation.setUtilisateurId(resolveClientUserId());

        Reservation saved = repository.save(reservation);
        String manageUrl = buildManageUrl(saved.getGestionToken());

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
                    saved.getNbPersonnes(),
                    manageUrl);
        } catch (EmailDeliveryException ex) {
            log.warn(
                    "Accusé client non envoyé pour réservation #{} : {}",
                    saved.getId(),
                    ex.getMessage());
        }

        notificationService.notifyStaff(
                NotificationType.NOUVELLE_RESERVATION,
                "Nouvelle réservation",
                saved.getNomClient()
                        + " · "
                        + saved.getNbPersonnes()
                        + " pers. · "
                        + saved.getDateReservation()
                        + " "
                        + saved.getHeureReservation(),
                "/admin/reservations");

        notifyLinkedClientReservation(
                saved,
                NotificationType.RESERVATION_CONFIRMEE,
                "Réservation confirmée",
                "Votre table du "
                        + saved.getDateReservation()
                        + " à "
                        + saved.getHeureReservation()
                        + " est confirmée.");

        return new ReservationResponseDto(
                saved.getId(),
                "Votre table est réservée. À bientôt à La Maison Orientale !",
                saved.getDateReservation(),
                saved.getHeureReservation(),
                saved.getNbPersonnes(),
                saved.getStatut().name(),
                saved.getCreatedAt(),
                saved.getGestionToken(),
                manageUrl);
    }

    @Transactional(readOnly = true)
    public PublicReservationDetailDto getByToken(String token) {
        Reservation reservation = repository
                .findByGestionToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable."));
        return toPublicDetail(reservation, false);
    }

    @Transactional(noRollbackFor = EmailDeliveryException.class)
    public PublicReservationDetailDto modifyByToken(String token, ModifyReservationRequest request) {
        Reservation reservation = repository
                .findByGestionToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable."));
        ensureModifiable(reservation);
        validateOnlinePartySize(request.nbPersonnes(), reservation.getNbPersonnes());
        validateAvailability(request.date(), request.heure(), request.nbPersonnes(), reservation.getId());

        LocalDate previousDate = reservation.getDateReservation();
        LocalTime previousHeure = reservation.getHeureReservation();
        int previousNbPersonnes = reservation.getNbPersonnes();

        reservation.setDateReservation(request.date());
        reservation.setHeureReservation(request.heure());
        reservation.setNbPersonnes(request.nbPersonnes());
        reservation.setCommentaire(trimToNull(request.commentaire()));

        Reservation saved = repository.save(reservation);
        String manageUrl = buildManageUrl(saved.getGestionToken());

        try {
            emailService.sendReservationModificationToClient(
                    saved.getEmailClient(),
                    saved.getNomClient(),
                    saved.getDateReservation(),
                    saved.getHeureReservation(),
                    saved.getNbPersonnes(),
                    manageUrl);
        } catch (EmailDeliveryException ex) {
            log.warn("E-mail modification client non envoyé : {}", ex.getMessage());
        }

        try {
            emailService.sendReservationModificationToRestaurant(
                    saved.getId(),
                    saved.getNomClient(),
                    saved.getEmailClient(),
                    saved.getTelephoneClient(),
                    previousDate,
                    previousHeure,
                    previousNbPersonnes,
                    saved.getDateReservation(),
                    saved.getHeureReservation(),
                    saved.getNbPersonnes(),
                    saved.getCommentaire());
        } catch (EmailDeliveryException ex) {
            log.warn("E-mail modification restaurant non envoyé : {}", ex.getMessage());
        }

        notificationService.notifyStaff(
                NotificationType.NOUVELLE_RESERVATION,
                "Réservation modifiée",
                saved.getNomClient()
                        + " · "
                        + saved.getNbPersonnes()
                        + " pers. · "
                        + saved.getDateReservation()
                        + " "
                        + saved.getHeureReservation(),
                "/admin/reservations");

        notifyLinkedClientReservation(
                saved,
                NotificationType.RESERVATION_MODIFIEE,
                "Réservation modifiée",
                "Votre table du "
                        + saved.getDateReservation()
                        + " à "
                        + saved.getHeureReservation()
                        + " a été mise à jour.");

        return toPublicDetail(saved, false);
    }

    @Transactional(noRollbackFor = EmailDeliveryException.class)
    public PublicReservationDetailDto cancelByToken(String token) {
        Reservation reservation = repository
                .findByGestionToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable."));
        ensureCancellable(reservation);

        reservation.setStatut(StatutReservation.ANNULEE);
        Reservation saved = repository.save(reservation);

        try {
            emailService.sendReservationCancellationToClient(
                    saved.getEmailClient(),
                    saved.getNomClient(),
                    saved.getDateReservation(),
                    saved.getHeureReservation());
        } catch (EmailDeliveryException ex) {
            log.warn("E-mail annulation client non envoyé : {}", ex.getMessage());
        }

        try {
            emailService.sendReservationCancellationToRestaurant(
                    saved.getId(),
                    saved.getNomClient(),
                    saved.getEmailClient(),
                    saved.getTelephoneClient(),
                    saved.getDateReservation(),
                    saved.getHeureReservation(),
                    saved.getNbPersonnes());
        } catch (EmailDeliveryException ex) {
            log.warn("E-mail annulation restaurant non envoyé : {}", ex.getMessage());
        }

        notificationService.notifyStaff(
                NotificationType.NOUVELLE_RESERVATION,
                "Réservation annulée",
                saved.getNomClient()
                        + " · "
                        + saved.getNbPersonnes()
                        + " pers. · "
                        + saved.getDateReservation()
                        + " "
                        + saved.getHeureReservation(),
                "/admin/reservations");

        notifyLinkedClientReservation(
                saved,
                NotificationType.RESERVATION_ANNULEE,
                "Réservation annulée",
                "Votre table du "
                        + saved.getDateReservation()
                        + " à "
                        + saved.getHeureReservation()
                        + " a été annulée.");

        return toPublicDetail(saved, false);
    }

    @Transactional(readOnly = true)
    public List<PublicReservationDetailDto> listForUser(Long userId) {
        return repository.findByUtilisateurIdOrderByDateReservationDescHeureReservationAsc(userId).stream()
                .map(r -> toPublicDetail(r, true))
                .toList();
    }

    private void ensureActiveReservation(Reservation reservation) {
        if (!ACTIVE.contains(reservation.getStatut())) {
            throw new IllegalArgumentException("Cette réservation ne peut plus être modifiée.");
        }
        if (!isFutureReservation(reservation)) {
            throw new IllegalArgumentException("Cette réservation est déjà passée.");
        }
    }

    private void ensureModifiable(Reservation reservation) {
        ensureActiveReservation(reservation);
        if (!isWithinModificationDeadline(reservation)) {
            int hours = settingsService.getInt("delai_modification_heures", DEFAULT_MODIFICATION_DEADLINE_HOURS);
            throw new IllegalArgumentException(
                    "Les modifications ne sont plus possibles moins de "
                            + hours
                            + " heures avant l'heure réservée.");
        }
    }

    private void ensureCancellable(Reservation reservation) {
        ensureActiveReservation(reservation);
        if (!isWithinCancellationDeadline(reservation)) {
            int maxOnline =
                    settingsService.getInt("seuil_annulation_en_ligne_personnes", DEFAULT_ONLINE_CANCELLATION_MAX);
            throw new IllegalArgumentException(
                    "Pour les groupes de plus de "
                            + maxOnline
                            + " personnes, l'annulation se fait par téléphone.");
        }
    }

    private boolean isFutureReservation(Reservation reservation) {
        return reservation.getDateReservation().isAfter(LocalDate.now())
                || (reservation.getDateReservation().isEqual(LocalDate.now())
                        && reservation.getHeureReservation().isAfter(LocalTime.now()));
    }

    private boolean isWithinModificationDeadline(Reservation reservation) {
        int deadlineHours = settingsService.getInt("delai_modification_heures", DEFAULT_MODIFICATION_DEADLINE_HOURS);
        LocalDateTime reservationAt =
                reservation.getDateReservation().atTime(reservation.getHeureReservation());
        return reservationAt.isAfter(LocalDateTime.now().plusHours(deadlineHours));
    }

    private boolean isWithinCancellationDeadline(Reservation reservation) {
        if (!isFutureReservation(reservation)) {
            return false;
        }
        int maxOnline =
                settingsService.getInt("seuil_annulation_en_ligne_personnes", DEFAULT_ONLINE_CANCELLATION_MAX);
        return reservation.getNbPersonnes() <= maxOnline;
    }

    private PublicReservationDetailDto toPublicDetail(Reservation reservation, boolean includeManageToken) {
        boolean active = ACTIVE.contains(reservation.getStatut());
        boolean future = isFutureReservation(reservation);
        boolean modifiable = active && future && isWithinModificationDeadline(reservation);
        boolean cancellable = active && future && isWithinCancellationDeadline(reservation);
        return new PublicReservationDetailDto(
                reservation.getId(),
                reservation.getDateReservation(),
                reservation.getHeureReservation(),
                reservation.getNbPersonnes(),
                reservation.getNomClient(),
                reservation.getEmailClient(),
                reservation.getTelephoneClient(),
                reservation.getCommentaire(),
                reservation.getStatut().name(),
                reservation.getCreatedAt(),
                modifiable,
                cancellable,
                includeManageToken ? reservation.getGestionToken() : null);
    }

    private void notifyLinkedClientReservation(
            Reservation reservation, NotificationType type, String titre, String message) {
        String lien = "/mon-compte/reservations";
        Long userId = reservation.getUtilisateurId();
        if (userId != null) {
            notificationService.notifyUser(userId, type, titre, message, lien);
            return;
        }
        notificationService.notifyClientByEmail(reservation.getEmailClient(), type, titre, message, lien);
    }

    private Long resolveClientUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return utilisateurRepository
                .findByEmailIgnoreCase(auth.getName())
                .filter(u -> u.getRole() == RoleUtilisateur.CLIENT)
                .map(Utilisateur::getId)
                .orElse(null);
    }

    private String buildManageUrl(String token) {
        return frontendUrl.replaceAll("/$", "") + "/reservation/gerer/" + token;
    }

    private void validateAvailability(LocalDate date, LocalTime heure, int nbPersonnes) {
        validateAvailability(date, heure, nbPersonnes, null);
    }

    private void validateAvailability(LocalDate date, LocalTime heure, int nbPersonnes, Long excludeReservationId) {
        if (horaireService.isClosed(date)) {
            throw new IllegalArgumentException("Le restaurant est fermé ce jour-là.");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La date ne peut pas être dans le passé.");
        }
        if (isOutsideBookingHorizon(date)) {
            int horizon = settingsService.getInt("horizon_reservation_jours", 60);
            throw new IllegalArgumentException(
                    "Les réservations sont possibles jusqu'à " + horizon + " jours à l'avance.");
        }

        var opening = horaireService
                .openingFor(date)
                .orElseThrow(() -> new IllegalArgumentException("Le restaurant est fermé ce jour-là."));

        LocalTime openTime = opening.open();
        LocalTime lastSlot = opening.close();
        int slotMinutes = settingsService.getInt("duree_creneau_minutes", 30);
        int tableDurationMinutes = settingsService.getInt("duree_table_minutes", DEFAULT_TABLE_DURATION_MINUTES);
        int maxCovers = settingsService.getInt("capacite_max_creneau", 50);

        if (heure.isBefore(openTime) || heure.isAfter(lastSlot)) {
            throw new IllegalArgumentException("Ce créneau n'est pas dans les horaires d'ouverture.");
        }
        int minutes = heure.getHour() * 60 + heure.getMinute();
        int openMinutes = openTime.getHour() * 60 + openTime.getMinute();
        if ((minutes - openMinutes) % slotMinutes != 0) {
            throw new IllegalArgumentException("Ce créneau n'est pas proposé.");
        }
        if (date.isEqual(LocalDate.now()) && !heure.isAfter(LocalTime.now().plusMinutes(30))) {
            throw new IllegalArgumentException("Ce créneau n'est plus disponible.");
        }

        List<Reservation> dayReservations =
                repository.findByDateReservationAndStatutInOrderByHeureReservationAsc(date, ACTIVE);
        if (remainingCoversForBookingStart(
                        heure, nbPersonnes, excludeReservationId, dayReservations, maxCovers, slotMinutes, tableDurationMinutes)
                < nbPersonnes) {
            throw new IllegalArgumentException(
                    "Ce créneau est complet. Choisissez un autre horaire.");
        }
    }

    private void validateOnlinePartySize(int nbPersonnes, Integer existingNbPersonnes) {
        int maxOnline =
                settingsService.getInt("seuil_annulation_en_ligne_personnes", DEFAULT_ONLINE_CANCELLATION_MAX);
        if (nbPersonnes <= maxOnline) {
            return;
        }
        if (existingNbPersonnes != null && existingNbPersonnes > maxOnline && nbPersonnes <= existingNbPersonnes) {
            return;
        }
        throw new IllegalArgumentException(
                "Pour les groupes de plus de " + maxOnline + " personnes, réservez par téléphone.");
    }

    private int remainingCoversForBookingStart(
            LocalTime start,
            int nbPersonnes,
            Long excludeReservationId,
            List<Reservation> dayReservations,
            int maxCovers,
            int slotMinutes,
            int tableDurationMinutes) {
        int minRemaining = maxCovers;
        for (LocalTime slot = start;
                slot.isBefore(start.plusMinutes(tableDurationMinutes));
                slot = slot.plusMinutes(slotMinutes)) {
            int occupied = occupiedCoversAtSlot(slot, excludeReservationId, dayReservations, tableDurationMinutes);
            minRemaining = Math.min(minRemaining, Math.max(0, maxCovers - occupied));
        }
        return minRemaining;
    }

    private int occupiedCoversAtSlot(
            LocalTime slot,
            Long excludeReservationId,
            List<Reservation> dayReservations,
            int tableDurationMinutes) {
        int occupied = 0;
        for (Reservation reservation : dayReservations) {
            if (excludeReservationId != null && excludeReservationId.equals(reservation.getId())) {
                continue;
            }
            if (!reservationOccupiesSlot(reservation.getHeureReservation(), slot, tableDurationMinutes)) {
                continue;
            }
            occupied += reservation.getNbPersonnes();
        }
        return occupied;
    }

    private boolean reservationOccupiesSlot(LocalTime reservationStart, LocalTime slot, int tableDurationMinutes) {
        LocalTime reservationEnd = reservationStart.plusMinutes(tableDurationMinutes);
        return !reservationStart.isAfter(slot) && reservationEnd.isAfter(slot);
    }

    private boolean isOutsideBookingHorizon(LocalDate date) {
        int horizon = settingsService.getInt("horizon_reservation_jours", 60);
        return date.isAfter(LocalDate.now().plusDays(horizon - 1L));
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
