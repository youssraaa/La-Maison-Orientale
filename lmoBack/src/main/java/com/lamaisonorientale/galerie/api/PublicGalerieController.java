package com.lamaisonorientale.galerie.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.galerie.application.GalerieService;
import com.lamaisonorientale.galerie.dto.PublicGaleriePhotoDto;

@RestController
@RequestMapping("/api/public/galerie")
public class PublicGalerieController {

    private final GalerieService galerieService;

    public PublicGalerieController(GalerieService galerieService) {
        this.galerieService = galerieService;
    }

    @GetMapping
    public List<PublicGaleriePhotoDto> list(
            @RequestParam(name = "accueil", defaultValue = "false") boolean accueil) {
        return galerieService.listPublic(accueil);
    }
}
