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
                      AND statut = 'CONFIRMEE'
                    """,
            nativeQuery = true)
    Integer sumActiveCovers(@Param("date") LocalDate date, @Param("heure") LocalTime heure);

    @Query(
            value =
                    """
                    SELECT COALESCE(SUM(nb_personnes), 0)
                    FROM reservation
                    WHERE date_reservation = :date
                      AND statut = 'CONFIRMEE'
                    """,
            nativeQuery = true)
    Integer sumActiveCoversForDate(@Param("date") LocalDate date);

    long countByDateReservationAndStatutIn(LocalDate date, Collection<StatutReservation> statuts);

    long countByDateReservationBetweenAndStatutIn(
            LocalDate from, LocalDate to, Collection<StatutReservation> statuts);

    long countByStatut(StatutReservation statut);

    long countByDateReservationBetween(LocalDate from, LocalDate to);

    long countByDateReservationBetweenAndStatut(
            LocalDate from, LocalDate to, StatutReservation statut);

    List<Reservation> findByDateReservationAndStatutInOrderByHeureReservationAsc(
            LocalDate date, Collection<StatutReservation> statuts);

    List<Reservation>
            findByDateReservationBetweenAndStatutInOrderByDateReservationAscHeureReservationAsc(
                    LocalDate from, LocalDate to, Collection<StatutReservation> statuts);

    @Query(
            value =
                    """
                    SELECT date_reservation, COUNT(*), COALESCE(SUM(nb_personnes), 0)
                    FROM reservation
                    WHERE date_reservation BETWEEN :fromDate AND :toDate
                      AND statut = 'CONFIRMEE'
                    GROUP BY date_reservation
                    ORDER BY date_reservation
                    """,
            nativeQuery = true)
    List<Object[]> aggregateActiveByDate(
            @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(
            value =
                    """
                    SELECT statut, COUNT(*)
                    FROM reservation
                    WHERE date_reservation BETWEEN :fromDate AND :toDate
                    GROUP BY statut
                    """,
            nativeQuery = true)
    List<Object[]> countGroupedByStatut(
            @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(
            value =
                    """
                    SELECT EXTRACT(HOUR FROM heure_reservation)::int, COUNT(*)
                    FROM reservation
                    WHERE date_reservation BETWEEN :fromDate AND :toDate
                      AND statut = 'CONFIRMEE'
                    GROUP BY EXTRACT(HOUR FROM heure_reservation)
                    ORDER BY 1
                    """,
            nativeQuery = true)
    List<Object[]> countActiveGroupedByHour(
            @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(
            value =
                    """
                    SELECT
                      CASE
                        WHEN nb_personnes <= 2 THEN '1-2'
                        WHEN nb_personnes <= 4 THEN '3-4'
                        WHEN nb_personnes <= 6 THEN '5-6'
                        ELSE '7+'
                      END AS bucket,
                      COUNT(*)
                    FROM reservation
                    WHERE date_reservation BETWEEN :fromDate AND :toDate
                      AND statut = 'CONFIRMEE'
                    GROUP BY bucket
                    ORDER BY bucket
                    """,
            nativeQuery = true)
    List<Object[]> countActiveGroupedByPartySize(
            @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(
            value =
                    """
                    SELECT EXTRACT(MONTH FROM date_reservation)::int, COUNT(*)
                    FROM reservation
                    WHERE date_reservation >= :yearStart
                      AND date_reservation <= :yearEnd
                      AND statut = 'CONFIRMEE'
                    GROUP BY EXTRACT(MONTH FROM date_reservation)
                    ORDER BY 1
                    """,
            nativeQuery = true)
    List<Object[]> countActiveGroupedByMonth(
            @Param("yearStart") LocalDate yearStart, @Param("yearEnd") LocalDate yearEnd);

    @Query(
            value =
                    """
                    SELECT
                      CASE
                        WHEN EXTRACT(HOUR FROM heure_reservation) < 17 THEN 'MIDI'
                        ELSE 'SOIR'
                      END AS service,
                      COUNT(*)
                    FROM reservation
                    WHERE date_reservation BETWEEN :fromDate AND :toDate
                      AND statut = 'CONFIRMEE'
                    GROUP BY service
                    ORDER BY service
                    """,
            nativeQuery = true)
    List<Object[]> countActiveGroupedByServicePeriod(
            @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    List<Reservation> findAllByOrderByDateReservationDescHeureReservationAsc();

    List<Reservation> findByDateReservationOrderByHeureReservationAsc(LocalDate date);

    List<Reservation> findByEmailClientIgnoreCaseOrderByCreatedAtDesc(String emailClient);

    List<Reservation> findByTelephoneClientOrderByCreatedAtDesc(String telephoneClient);

    List<Reservation> findByUtilisateurIdOrderByDateReservationDescHeureReservationAsc(Long utilisateurId);

    java.util.Optional<Reservation> findByGestionToken(String gestionToken);
}
