package com.lamaisonorientale.demande.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.demande.domain.DemandeClient;

public interface DemandeClientRepository extends JpaRepository<DemandeClient, Long> {
}
