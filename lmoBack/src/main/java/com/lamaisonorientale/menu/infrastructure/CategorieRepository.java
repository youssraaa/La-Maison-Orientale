package com.lamaisonorientale.menu.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.menu.domain.Categorie;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    List<Categorie> findAllByOrderByOrdreAffichageAscIdAsc();

    List<Categorie> findByActiveTrueOrderByOrdreAffichageAscIdAsc();

    Optional<Categorie> findBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);

    boolean existsBySlugIgnoreCase(String slug);
}
