package com.lamaisonorientale.galerie.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.galerie.domain.GaleriePhoto;

public interface GaleriePhotoRepository extends JpaRepository<GaleriePhoto, Long> {

    List<GaleriePhoto> findAllByOrderByOrdreAffichageAscIdAsc();

    List<GaleriePhoto> findByActiveTrueOrderByOrdreAffichageAscIdAsc();

    List<GaleriePhoto> findByActiveTrueAndAfficherAccueilTrueOrderByOrdreAffichageAscIdAsc();
}
