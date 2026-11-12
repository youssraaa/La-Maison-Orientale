package com.lamaisonorientale.commande.infrastructure;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lamaisonorientale.commande.domain.Commande;

public interface CommandeRepository extends JpaRepository<Commande, Long> {

    Optional<Commande> findByGestionToken(String gestionToken);

    List<Commande> findByUtilisateurIdOrderByCreatedAtDesc(Long utilisateurId);

    List<Commande> findByEmailClientIgnoreCaseOrderByCreatedAtDesc(String emailClient);

    List<Commande> findAllByOrderByCreatedAtDesc();

    @Query(
            value =
                    """
                    SELECT c.* FROM commande c
                    WHERE (c.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Brussels')::date = :date
                    ORDER BY c.created_at DESC
                    """,
            nativeQuery = true)
    List<Commande> findByDateBrussels(@Param("date") java.time.LocalDate date);

    long countByReferenceStartingWith(String prefix);

    @Query(
            value =
                    """
                    SELECT COUNT(*)
                    FROM commande
                    WHERE created_at >= :fromInstant
                      AND created_at < :toExclusive
                      AND statut <> 'ANNULEE'
                    """,
            nativeQuery = true)
    long countActiveBetween(
            @Param("fromInstant") Instant fromInstant, @Param("toExclusive") Instant toExclusive);

    @Query(
            value =
                    """
                    SELECT COALESCE(SUM(total), 0)
                    FROM commande
                    WHERE created_at >= :fromInstant
                      AND created_at < :toExclusive
                      AND statut <> 'ANNULEE'
                    """,
            nativeQuery = true)
    BigDecimal sumActiveTotalBetween(
            @Param("fromInstant") Instant fromInstant, @Param("toExclusive") Instant toExclusive);

    @Query(
            value =
                    """
                    SELECT CAST((created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Brussels') AS date),
                           COUNT(*),
                           COALESCE(SUM(total), 0)
                    FROM commande
                    WHERE created_at >= :fromInstant
                      AND created_at < :toExclusive
                      AND statut <> 'ANNULEE'
                    GROUP BY 1
                    ORDER BY 1
                    """,
            nativeQuery = true)
    List<Object[]> aggregateActiveByDay(
            @Param("fromInstant") Instant fromInstant, @Param("toExclusive") Instant toExclusive);

    @Query(
            value =
                    """
                    SELECT statut, COUNT(*)
                    FROM commande
                    WHERE created_at >= :fromInstant
                      AND created_at < :toExclusive
                    GROUP BY statut
                    """,
            nativeQuery = true)
    List<Object[]> countGroupedByStatut(
            @Param("fromInstant") Instant fromInstant, @Param("toExclusive") Instant toExclusive);

    @Query(
            value =
                    """
                    SELECT EXTRACT(MONTH FROM (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Brussels'))::int,
                           COUNT(*),
                           COALESCE(SUM(total), 0)
                    FROM commande
                    WHERE created_at >= :fromInstant
                      AND created_at < :toExclusive
                      AND statut <> 'ANNULEE'
                    GROUP BY 1
                    ORDER BY 1
                    """,
            nativeQuery = true)
    List<Object[]> aggregateActiveByMonth(
            @Param("fromInstant") Instant fromInstant, @Param("toExclusive") Instant toExclusive);
}
