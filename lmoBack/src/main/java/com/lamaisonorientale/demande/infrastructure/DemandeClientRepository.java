package com.lamaisonorientale.demande.infrastructure;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.domain.StatutDemande;

public interface DemandeClientRepository extends JpaRepository<DemandeClient, Long> {

    long countByStatut(StatutDemande statut);

    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant from, Instant toExclusive);

    List<DemandeClient> findTop5ByOrderByCreatedAtDesc();

    @Query(
            value =
                    """
                    SELECT CAST((created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Brussels') AS date),
                           COUNT(*)
                    FROM demande_client
                    WHERE created_at >= :fromInstant
                      AND created_at < :toExclusive
                    GROUP BY 1
                    ORDER BY 1
                    """,
            nativeQuery = true)
    List<Object[]> countGroupedByDay(
            @Param("fromInstant") Instant fromInstant, @Param("toExclusive") Instant toExclusive);
}
