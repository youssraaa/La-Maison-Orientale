package com.lamaisonorientale.menu.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.menu.application.MenuService;
import com.lamaisonorientale.menu.dto.CategorieDto;
import com.lamaisonorientale.menu.dto.PlatDto;
import com.lamaisonorientale.menu.dto.UpsertCategorieRequest;
import com.lamaisonorientale.menu.dto.UpsertPlatRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/menu")
public class AdminMenuController {

    private final MenuService menuService;

    public AdminMenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/categories")
    public List<CategorieDto> listCategories() {
        return menuService.listCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategorieDto createCategorie(@Valid @RequestBody UpsertCategorieRequest request) {
        return menuService.createCategorie(request);
    }

    @PutMapping("/categories/{id}")
    public CategorieDto updateCategorie(
            @PathVariable Long id, @Valid @RequestBody UpsertCategorieRequest request) {
        return menuService.updateCategorie(id, request);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategorie(@PathVariable Long id) {
        menuService.deleteCategorie(id);
    }

    @GetMapping("/plats")
    public List<PlatDto> listPlats(@RequestParam(required = false) Long categorieId) {
        return menuService.listPlats(categorieId);
    }

    @PostMapping("/plats")
    @ResponseStatus(HttpStatus.CREATED)
    public PlatDto createPlat(@Valid @RequestBody UpsertPlatRequest request) {
        return menuService.createPlat(request);
    }

    @PutMapping("/plats/{id}")
    public PlatDto updatePlat(@PathVariable Long id, @Valid @RequestBody UpsertPlatRequest request) {
        return menuService.updatePlat(id, request);
    }

    @DeleteMapping("/plats/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePlat(@PathVariable Long id) {
        menuService.deletePlat(id);
    }
}
