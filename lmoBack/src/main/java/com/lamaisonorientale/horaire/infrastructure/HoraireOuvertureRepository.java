package com.lamaisonorientale.horaire.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.horaire.domain.HoraireOuverture;

public interface HoraireOuvertureRepository extends JpaRepository<HoraireOuverture, Long> {

    List<HoraireOuverture> findAllByOrderByJourSemaineAsc();
}
