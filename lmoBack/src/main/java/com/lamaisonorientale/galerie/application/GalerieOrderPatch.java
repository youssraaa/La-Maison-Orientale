package com.lamaisonorientale.galerie.application;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.galerie.domain.GaleriePhoto;
import com.lamaisonorientale.galerie.infrastructure.GaleriePhotoRepository;

/**
 * Aligne l'ordre des photos en base sur la galerie publique (3 par ligne :
 * lieu, puis plats phares, puis le reste).
 */
@Component
@Order(22)
public class GalerieOrderPatch implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(GalerieOrderPatch.class);

    private static final List<String> ORDER =
            List.of(
                    "/images/gallery/photo-1972.png",
                    "/images/terrace.jpg",
                    "/images/gallery/salle-1.png",
                    "/images/gallery/photo-1322.png",
                    "/images/gallery/photo-1447.png",
                    "/images/gallery/photo-1501.png",
                    "/images/gallery/salle-2.png",
                    "/images/gallery/photo-0547.png",
                    "/images/gallery/photo-0765-1.png",
                    "/images/gallery/photo-0914.png",
                    "/images/gallery/photo-0964.png",
                    "/images/gallery/photo-1191.png",
                    "/images/gallery/photo-1452.png",
                    "/images/gallery/photo-1454.png",
                    "/images/gallery/photo-1509.png",
                    "/images/gallery/photo-2073.png",
                    "/images/gallery/photo-2074.png",
                    "/images/gallery/photo-2224.png",
                    "/images/gallery/photo-2466.png",
                    "/images/gallery/photo-2471.png",
                    "/images/gallery/photo-2624.png",
                    "/images/gallery/photo-2626.png",
                    "/images/gallery/photo-7065.png",
                    "/images/gallery/photo-7068.png",
                    "/images/gallery/photo-7069.png",
                    "/images/gallery/photo-7070.png",
                    "/images/gallery/photo-8374.png",
                    "/images/gallery/photo-8379.png",
                    "/images/gallery/photo-8381.png",
                    "/images/gallery/photo-8406.png");

    private static final Map<String, String> ALTS =
            Map.ofEntries(
                    Map.entry("/images/gallery/photo-1972.png", "Façade de La Maison Orientale"),
                    Map.entry("/images/terrace.jpg", "Terrasse de La Maison Orientale"),
                    Map.entry("/images/gallery/salle-1.png", "Salle de La Maison Orientale"),
                    Map.entry(
                            "/images/gallery/photo-1322.png",
                            "Thé à la menthe servi au comptoir"),
                    Map.entry("/images/gallery/photo-1447.png", "Mezzés et entrées froides"),
                    Map.entry(
                            "/images/gallery/photo-1501.png",
                            "Brochettes viande et aubergine"),
                    Map.entry("/images/gallery/salle-2.png", "Intérieur de La Maison Orientale"));

    private final GaleriePhotoRepository galeriePhotoRepository;

    public GalerieOrderPatch(GaleriePhotoRepository galeriePhotoRepository) {
        this.galeriePhotoRepository = galeriePhotoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<GaleriePhoto> photos = galeriePhotoRepository.findAllByOrderByOrdreAffichageAscIdAsc();
        if (photos.isEmpty()) {
            return;
        }

        Map<String, GaleriePhoto> byUrl = new LinkedHashMap<>();
        for (GaleriePhoto photo : photos) {
            byUrl.putIfAbsent(photo.getImageUrl(), photo);
        }

        List<GaleriePhoto> ordered = new ArrayList<>();
        for (String url : ORDER) {
            GaleriePhoto photo = byUrl.remove(url);
            if (photo != null) {
                ordered.add(photo);
            }
        }
        ordered.addAll(byUrl.values());

        boolean changed = false;
        for (int i = 0; i < ordered.size(); i++) {
            GaleriePhoto photo = ordered.get(i);
            if (photo.getOrdreAffichage() != i) {
                photo.setOrdreAffichage(i);
                changed = true;
            }
            String alt = ALTS.get(photo.getImageUrl());
            if (alt != null && !alt.equals(photo.getAlt())) {
                photo.setAlt(alt);
                changed = true;
            }
        }

        if (changed) {
            galeriePhotoRepository.saveAll(ordered);
            log.info("Ordre galerie mis à jour ({} photos).", ordered.size());
        }
    }
}
