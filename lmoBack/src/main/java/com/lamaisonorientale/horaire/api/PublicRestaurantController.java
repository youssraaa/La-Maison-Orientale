package com.lamaisonorientale.horaire.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.horaire.application.HoraireService;
import com.lamaisonorientale.horaire.application.RestaurantInfoService;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
import com.lamaisonorientale.horaire.dto.PublicHoursDto;
import com.lamaisonorientale.horaire.dto.PublicOrderPolicyDto;
import com.lamaisonorientale.horaire.dto.PublicReservationPolicyDto;
import com.lamaisonorientale.horaire.dto.PublicRestaurantInfoDto;

@RestController
@RequestMapping("/api/public/restaurant")
public class PublicRestaurantController {

    private final RestaurantInfoService restaurantInfoService;
    private final HoraireService horaireService;
    private final RestaurantSettingsService restaurantSettingsService;

    public PublicRestaurantController(
            RestaurantInfoService restaurantInfoService,
            HoraireService horaireService,
            RestaurantSettingsService restaurantSettingsService) {
        this.restaurantInfoService = restaurantInfoService;
        this.horaireService = horaireService;
        this.restaurantSettingsService = restaurantSettingsService;
    }

    @GetMapping("/info")
    public PublicRestaurantInfoDto getInfo() {
        return restaurantInfoService.getPublicInfo();
    }

    @GetMapping("/hours")
    public PublicHoursDto getHours() {
        return horaireService.getPublicHours();
    }

    @GetMapping("/reservation-policy")
    public PublicReservationPolicyDto getReservationPolicy() {
        return restaurantSettingsService.getPublicPolicy();
    }

    @GetMapping("/order-policy")
    public PublicOrderPolicyDto getOrderPolicy() {
        return restaurantSettingsService.getPublicOrderPolicy();
    }
}
