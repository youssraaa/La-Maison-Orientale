package com.lamaisonorientale.menu.application;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.menu.domain.Categorie;
import com.lamaisonorientale.menu.domain.Plat;
import com.lamaisonorientale.menu.dto.CategorieDto;
import com.lamaisonorientale.menu.dto.PlatDto;
import com.lamaisonorientale.menu.dto.PublicMenuDto;
import com.lamaisonorientale.menu.dto.UpsertCategorieRequest;
import com.lamaisonorientale.menu.dto.UpsertPlatRequest;
import com.lamaisonorientale.menu.infrastructure.CategorieRepository;
import com.lamaisonorientale.menu.infrastructure.PlatRepository;

@Service
public class MenuService {

    private final CategorieRepository categorieRepository;
    private final PlatRepository platRepository;

    public MenuService(CategorieRepository categorieRepository, PlatRepository platRepository) {
        this.categorieRepository = categorieRepository;
        this.platRepository = platRepository;
    }

    @Transactional(readOnly = true)
    public List<CategorieDto> listCategories() {
        return categorieRepository.findAllByOrderByOrdreAffichageAscIdAsc().stream()
                .map(this::toCategorieDto)
                .toList();
    }

    @Transactional
    public CategorieDto createCategorie(UpsertCategorieRequest request) {
        Categorie cat = new Categorie();
        applyCategorie(cat, request, null);
        CategorieDto saved = toCategorieDto(categorieRepository.save(cat));
        return saved;
    }

    @Transactional
    public CategorieDto updateCategorie(Long id, UpsertCategorieRequest request) {
        Categorie cat = categorieRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable."));
        applyCategorie(cat, request, id);
        CategorieDto saved = toCategorieDto(categorieRepository.save(cat));
        return saved;
    }

    @Transactional
    public void deleteCategorie(Long id) {
        if (!categorieRepository.existsById(id)) {
            throw new IllegalArgumentException("Catégorie introuvable.");
        }
        platRepository.deleteByCategorieId(id);
        categorieRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<PlatDto> listPlats(Long categorieId) {
        List<Plat> plats =
                categorieId == null
                        ? platRepository.findAllByOrderByOrdreAffichageAscIdAsc()
                        : platRepository.findByCategorieIdOrderByOrdreAffichageAscIdAsc(categorieId);
        return plats.stream().map(this::toPlatDto).toList();
    }

    @Transactional
    public PlatDto createPlat(UpsertPlatRequest request) {
        Plat plat = new Plat();
        applyPlat(plat, request);
        PlatDto saved = toPlatDto(platRepository.save(plat));
        return saved;
    }

    @Transactional
    public PlatDto updatePlat(Long id, UpsertPlatRequest request) {
        Plat plat = platRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plat introuvable."));
        applyPlat(plat, request);
        PlatDto saved = toPlatDto(platRepository.save(plat));
        return saved;
    }

    @Transactional
    public void deletePlat(Long id) {
        if (!platRepository.existsById(id)) {
            throw new IllegalArgumentException("Plat introuvable.");
        }
        platRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PublicMenuDto publicMenu() {
        List<Categorie> categories = categorieRepository.findByActiveTrueOrderByOrdreAffichageAscIdAsc();
        List<Plat> plats = platRepository.findAllByOrderByOrdreAffichageAscIdAsc().stream()
                .filter(p -> Boolean.TRUE.equals(p.getDisponibleEmporter()) || Boolean.TRUE.equals(p.getDisponibleLivraison()))
                .toList();

        Map<Long, List<Plat>> byCat = new LinkedHashMap<>();
        for (Plat p : plats) {
            byCat.computeIfAbsent(p.getCategorie().getId(), k -> new ArrayList<>()).add(p);
        }

        List<PublicMenuDto.PublicCategoryDto> out = new ArrayList<>();
        for (Categorie cat : categories) {
            List<Plat> items = byCat.getOrDefault(cat.getId(), List.of());
            boolean hasSub = items.stream().anyMatch(p -> p.getSousSection() != null && !p.getSousSection().isBlank());

            List<PublicMenuDto.PublicItemDto> flat = null;
            List<PublicMenuDto.PublicSubsectionDto> subsections = null;

            if (hasSub) {
                Map<String, List<PublicMenuDto.PublicItemDto>> grouped = new LinkedHashMap<>();
                for (Plat p : items) {
                    String key =
                            p.getSousSection() == null || p.getSousSection().isBlank()
                                    ? "Autres"
                                    : p.getSousSection().trim();
                    grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(toPublicItem(p));
                }
                subsections =
                        grouped.entrySet().stream()
                                .map(e -> new PublicMenuDto.PublicSubsectionDto(e.getKey(), e.getValue()))
                                .toList();
            } else {
                flat = items.stream().map(this::toPublicItem).toList();
            }

            out.add(
                    new PublicMenuDto.PublicCategoryDto(
                            cat.getSlug() != null ? cat.getSlug() : String.valueOf(cat.getId()),
                            cat.getNom(),
                            cat.getImageUrl(),
                            cat.getNote(),
                            flat,
                            subsections));
        }
        return new PublicMenuDto(out);
    }

    private void applyCategorie(Categorie cat, UpsertCategorieRequest request, Long currentId) {
        String nom = request.nom().trim();
        String slug = request.slug() == null || request.slug().isBlank() ? slugify(nom) : slugify(request.slug());

        boolean taken =
                currentId == null
                        ? categorieRepository.existsBySlugIgnoreCase(slug)
                        : categorieRepository.existsBySlugIgnoreCaseAndIdNot(slug, currentId);
        if (taken) {
            throw new IllegalArgumentException("Ce slug de catégorie est déjà utilisé.");
        }

        cat.setNom(nom);
        cat.setSlug(slug);
        cat.setImageUrl(blankToNull(request.imageUrl()));
        cat.setNote(blankToNull(request.note()));
        cat.setOrdreAffichage(request.ordreAffichage() == null ? 0 : request.ordreAffichage());
        cat.setActive(request.active() == null || request.active());
    }

    private void applyPlat(Plat plat, UpsertPlatRequest request) {
        Categorie cat = categorieRepository
                .findById(request.categorieId())
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable."));
        plat.setCategorie(cat);
        plat.setNom(request.nom().trim());
        plat.setDescription(blankToNull(request.description()));
        plat.setPrix(request.prix());
        plat.setDisponibleEmporter(request.disponibleEmporter() == null || request.disponibleEmporter());
        plat.setDisponibleLivraison(request.disponibleLivraison() == null || request.disponibleLivraison());
        plat.setImageUrl(blankToNull(request.imageUrl()));
        plat.setOrdreAffichage(request.ordreAffichage() == null ? 0 : request.ordreAffichage());
        plat.setSousSection(blankToNull(request.sousSection()));
        plat.setFeatured(Boolean.TRUE.equals(request.featured()));
    }

    private CategorieDto toCategorieDto(Categorie c) {
        return new CategorieDto(
                c.getId(),
                c.getNom(),
                c.getSlug(),
                c.getImageUrl(),
                c.getNote(),
                c.getOrdreAffichage(),
                c.getActive());
    }

    private PlatDto toPlatDto(Plat p) {
        String imageUrl = p.getImageUrl();
        if (imageUrl == null || imageUrl.isBlank()) {
            imageUrl = DishImageCatalog.resolve(p.getNom());
        }
        return new PlatDto(
                p.getId(),
                p.getCategorie().getId(),
                p.getNom(),
                p.getDescription(),
                p.getPrix(),
                p.getDisponibleEmporter(),
                p.getDisponibleLivraison(),
                imageUrl,
                p.getOrdreAffichage(),
                p.getSousSection(),
                p.getFeatured());
    }

    private PublicMenuDto.PublicItemDto toPublicItem(Plat p) {
        String imageUrl = p.getImageUrl();
        if (imageUrl == null || imageUrl.isBlank()) {
            imageUrl = DishImageCatalog.resolve(p.getNom());
        }
        return new PublicMenuDto.PublicItemDto(
                p.getId(),
                p.getNom(),
                p.getDescription(),
                p.getPrix(),
                Boolean.TRUE.equals(p.getFeatured()) ? true : null,
                imageUrl,
                p.getDisponibleEmporter(),
                p.getDisponibleLivraison());
    }

    static String slugify(String value) {
        String normalized =
                Normalizer.normalize(Objects.requireNonNullElse(value, ""), Normalizer.Form.NFD)
                        .replaceAll("\\p{M}", "")
                        .toLowerCase(Locale.ROOT)
                        .replaceAll("[^a-z0-9]+", "-")
                        .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "categorie" : normalized;
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
