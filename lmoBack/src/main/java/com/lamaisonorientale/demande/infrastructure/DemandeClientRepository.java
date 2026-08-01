package com.lamaisonorientale.demande.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.domain.StatutDemande;

public interface DemandeClientRepository extends JpaRepository<DemandeClient, Long> {

    long countByStatut(StatutDemande statut);

    List<DemandeClient> findTop5ByOrderByCreatedAtDesc();
}
