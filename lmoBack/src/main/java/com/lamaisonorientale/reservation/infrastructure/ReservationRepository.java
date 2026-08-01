package com.lamaisonorientale.reservation.infrastructure;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.domain.StatutReservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query(
            value =
                    """
                    SELECT COALESCE(SUM(nb_personnes), 0)
                    FROM reservation
                    WHERE date_reservation = :date
                      AND heure_reservation = :heure
                      AND statut IN ('EN_ATTENTE', 'CONFIRMEE')
                    """,
            nativeQuery = true)
    Integer sumActiveCovers(@Param("date") LocalDate date, @Param("heure") LocalTime heure);

    @Query(
            value =
                    """
                    SELECT COALESCE(SUM(nb_personnes), 0)
                    FROM reservation
                    WHERE date_reservation = :date
                      AND statut IN ('EN_ATTENTE', 'CONFIRMEE')
                    """,
            nativeQuery = true)
    Integer sumActiveCoversForDate(@Param("date") LocalDate date);

    long countByDateReservationAndStatutIn(LocalDate date, Collection<StatutReservation> statuts);

    long countByDateReservationBetweenAndStatutIn(
            LocalDate from, LocalDate to, Collection<StatutReservation> statuts);

    long countByStatut(StatutReservation statut);

    List<Reservation> findByDateReservationAndStatutInOrderByHeureReservationAsc(
            LocalDate date, Collection<StatutReservation> statuts);

    List<Reservation>
            findByDateReservationBetweenAndStatutInOrderByDateReservationAscHeureReservationAsc(
                    LocalDate from, LocalDate to, Collection<StatutReservation> statuts);
}
