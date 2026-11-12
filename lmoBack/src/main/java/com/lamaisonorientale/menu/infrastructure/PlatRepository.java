package com.lamaisonorientale.menu.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.menu.domain.Plat;

public interface PlatRepository extends JpaRepository<Plat, Long> {

    List<Plat> findAllByOrderByOrdreAffichageAscIdAsc();

    List<Plat> findByCategorieIdOrderByOrdreAffichageAscIdAsc(Long categorieId);

    @Modifying
    @Transactional
    void deleteByCategorieId(Long categorieId);
}
