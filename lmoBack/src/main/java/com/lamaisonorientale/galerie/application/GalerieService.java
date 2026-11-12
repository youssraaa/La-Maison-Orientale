package com.lamaisonorientale.galerie.application;



import java.util.List;



import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;



import com.lamaisonorientale.galerie.domain.GaleriePhoto;

import com.lamaisonorientale.galerie.dto.GaleriePhotoDto;

import com.lamaisonorientale.galerie.dto.PublicGaleriePhotoDto;

import com.lamaisonorientale.galerie.dto.UpsertGaleriePhotoRequest;

import com.lamaisonorientale.galerie.infrastructure.GaleriePhotoRepository;



@Service

public class GalerieService {



    private final GaleriePhotoRepository galeriePhotoRepository;



    public GalerieService(GaleriePhotoRepository galeriePhotoRepository) {

        this.galeriePhotoRepository = galeriePhotoRepository;

    }



    @Transactional(readOnly = true)

    public List<GaleriePhotoDto> listAdmin() {

        return galeriePhotoRepository.findAllByOrderByOrdreAffichageAscIdAsc().stream()

                .map(this::toDto)

                .toList();

    }



    @Transactional

    public GaleriePhotoDto create(UpsertGaleriePhotoRequest request) {

        GaleriePhoto photo = new GaleriePhoto();

        apply(photo, request);

        return toDto(galeriePhotoRepository.save(photo));

    }



    @Transactional

    public GaleriePhotoDto update(Long id, UpsertGaleriePhotoRequest request) {

        GaleriePhoto photo = galeriePhotoRepository

                .findById(id)

                .orElseThrow(() -> new IllegalArgumentException("Photo introuvable."));

        apply(photo, request);

        return toDto(galeriePhotoRepository.save(photo));

    }



    @Transactional

    public void delete(Long id) {

        if (!galeriePhotoRepository.existsById(id)) {

            throw new IllegalArgumentException("Photo introuvable.");

        }

        galeriePhotoRepository.deleteById(id);

    }



    @Transactional(readOnly = true)

    public List<PublicGaleriePhotoDto> listPublic(boolean accueilOnly) {

        List<GaleriePhoto> photos =

                accueilOnly

                        ? galeriePhotoRepository

                                .findByActiveTrueAndAfficherAccueilTrueOrderByOrdreAffichageAscIdAsc()

                        : galeriePhotoRepository.findByActiveTrueOrderByOrdreAffichageAscIdAsc();

        return photos.stream()

                .map(p -> new PublicGaleriePhotoDto(p.getImageUrl(), p.getAlt() == null ? "" : p.getAlt()))

                .toList();

    }



    private void apply(GaleriePhoto photo, UpsertGaleriePhotoRequest request) {

        photo.setImageUrl(request.imageUrl().trim());

        photo.setAlt(request.alt() == null || request.alt().isBlank() ? null : request.alt().trim());

        photo.setOrdreAffichage(request.ordreAffichage() == null ? 0 : request.ordreAffichage());

        photo.setActive(request.active() == null || request.active());

        photo.setAfficherAccueil(Boolean.TRUE.equals(request.afficherAccueil()));

    }



    private GaleriePhotoDto toDto(GaleriePhoto p) {

        return new GaleriePhotoDto(

                p.getId(),

                p.getImageUrl(),

                p.getAlt(),

                p.getOrdreAffichage(),

                p.getActive(),

                p.getAfficherAccueil());

    }

}


