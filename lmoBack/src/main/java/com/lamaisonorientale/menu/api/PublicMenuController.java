package com.lamaisonorientale.menu.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.menu.application.MenuService;
import com.lamaisonorientale.menu.dto.PublicMenuDto;

@RestController
@RequestMapping("/api/public/menu")
public class PublicMenuController {

    private final MenuService menuService;

    public PublicMenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public PublicMenuDto getMenu() {
        return menuService.publicMenu();
    }
}
