package com.lamaisonorientale.horaire.infrastructure;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.horaire.domain.FermetureExceptionnelle;

public interface FermetureExceptionnelleRepository extends JpaRepository<FermetureExceptionnelle, Long> {

    List<FermetureExceptionnelle> findAllByOrderByDateFermetureAsc();

    Optional<FermetureExceptionnelle> findByDateFermeture(LocalDate date);

    boolean existsByDateFermetureAndIdNot(LocalDate date, Long id);
}
