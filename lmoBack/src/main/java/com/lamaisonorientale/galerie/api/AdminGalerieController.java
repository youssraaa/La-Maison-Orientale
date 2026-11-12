package com.lamaisonorientale.galerie.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.galerie.application.GalerieService;
import com.lamaisonorientale.galerie.dto.GaleriePhotoDto;
import com.lamaisonorientale.galerie.dto.UpsertGaleriePhotoRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/galerie")
public class AdminGalerieController {

    private final GalerieService galerieService;

    public AdminGalerieController(GalerieService galerieService) {
        this.galerieService = galerieService;
    }

    @GetMapping
    public List<GaleriePhotoDto> list() {
        return galerieService.listAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GaleriePhotoDto create(@Valid @RequestBody UpsertGaleriePhotoRequest request) {
        return galerieService.create(request);
    }

    @PutMapping("/{id}")
    public GaleriePhotoDto update(
            @PathVariable Long id, @Valid @RequestBody UpsertGaleriePhotoRequest request) {
        return galerieService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        galerieService.delete(id);
    }
}
