package com.lamaisonorientale.horaire.api;

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

import com.lamaisonorientale.horaire.application.HoraireService;
import com.lamaisonorientale.horaire.application.RestaurantInfoService;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
import com.lamaisonorientale.horaire.dto.FermetureDto;
import com.lamaisonorientale.horaire.dto.HoraireDto;
import com.lamaisonorientale.horaire.dto.RestaurantInfoDto;
import com.lamaisonorientale.horaire.dto.RestaurantSettingsDto;
import com.lamaisonorientale.horaire.dto.UpdateRestaurantInfoRequest;
import com.lamaisonorientale.horaire.dto.UpdateRestaurantSettingsRequest;
import com.lamaisonorientale.horaire.dto.UpsertFermetureRequest;
import com.lamaisonorientale.horaire.dto.UpsertHoraireRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminHoraireController {

    private final HoraireService horaireService;
    private final RestaurantSettingsService restaurantSettingsService;
    private final RestaurantInfoService restaurantInfoService;

    public AdminHoraireController(
            HoraireService horaireService,
            RestaurantSettingsService restaurantSettingsService,
            RestaurantInfoService restaurantInfoService) {
        this.horaireService = horaireService;
        this.restaurantSettingsService = restaurantSettingsService;
        this.restaurantInfoService = restaurantInfoService;
    }

    @GetMapping("/horaires")
    public List<HoraireDto> listHoraires() {
        return horaireService.listHoraires();
    }

    @PutMapping("/horaires")
    public HoraireDto upsertHoraire(@Valid @RequestBody UpsertHoraireRequest request) {
        return horaireService.upsertHoraire(request);
    }

    @GetMapping("/fermetures")
    public List<FermetureDto> listFermetures() {
        return horaireService.listFermetures();
    }

    @PostMapping("/fermetures")
    @ResponseStatus(HttpStatus.CREATED)
    public FermetureDto createFermeture(@Valid @RequestBody UpsertFermetureRequest request) {
        return horaireService.createFermeture(request);
    }

    @PutMapping("/fermetures/{id}")
    public FermetureDto updateFermeture(
            @PathVariable Long id, @Valid @RequestBody UpsertFermetureRequest request) {
        return horaireService.updateFermeture(id, request);
    }

    @DeleteMapping("/fermetures/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFermeture(@PathVariable Long id) {
        horaireService.deleteFermeture(id);
    }

    @GetMapping("/restaurant/settings")
    public RestaurantSettingsDto getSettings() {
        return restaurantSettingsService.getSettings();
    }

    @PutMapping("/restaurant/settings")
    public RestaurantSettingsDto updateSettings(@RequestBody UpdateRestaurantSettingsRequest request) {
        return restaurantSettingsService.update(request);
    }

    @GetMapping("/restaurant/info")
    public RestaurantInfoDto getInfo() {
        return restaurantInfoService.getInfo();
    }

    @PutMapping("/restaurant/info")
    public RestaurantInfoDto updateInfo(@RequestBody UpdateRestaurantInfoRequest request) {
        return restaurantInfoService.update(request);
    }
}
