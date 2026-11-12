package com.lamaisonorientale.galerie.application;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.galerie.domain.GaleriePhoto;
import com.lamaisonorientale.galerie.infrastructure.GaleriePhotoRepository;

@Component
@Order(21)
public class GalerieCatalogSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(GalerieCatalogSeeder.class);

    private static final List<String> HOME_SRC =
            List.of(
                    "/images/gallery/photo-1447.png",
                    "/images/gallery/photo-1322.png",
                    "/images/gallery/photo-8374.png",
                    "/images/gallery/photo-2074.png",
                    "/images/gallery/photo-1501.png",
                    "/images/gallery/photo-2624.png");

    private final GaleriePhotoRepository galeriePhotoRepository;

    public GalerieCatalogSeeder(GaleriePhotoRepository galeriePhotoRepository) {
        this.galeriePhotoRepository = galeriePhotoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (galeriePhotoRepository.count() > 0) {
            return;
        }

        int ordre = 0;
        save("/images/gallery/photo-1972.png", "Façade de La Maison Orientale", ordre++);
        save("/images/terrace.jpg", "Terrasse de La Maison Orientale", ordre++);
        save("/images/gallery/salle-1.png", "Salle de La Maison Orientale", ordre++);
        save("/images/gallery/photo-1322.png", "Thé à la menthe servi au comptoir", ordre++);
        save("/images/gallery/photo-1447.png", "Mezzés et entrées froides", ordre++);
        save("/images/gallery/photo-1501.png", "Brochettes viande et aubergine", ordre++);
        save("/images/gallery/salle-2.png", "Intérieur de La Maison Orientale", ordre++);

        for (String id :
                List.of(
                        "0547",
                        "0765-1",
                        "0914",
                        "0964",
                        "1191",
                        "1452",
                        "1454",
                        "1509",
                        "2073",
                        "2074",
                        "2224",
                        "2466",
                        "2471",
                        "2624",
                        "2626",
                        "7065",
                        "7068",
                        "7069",
                        "7070",
                        "8374",
                        "8379",
                        "8381",
                        "8406")) {
            save("/images/gallery/photo-" + id + ".png", "La Maison Orientale", ordre++);
        }

        log.info("Galerie seedée ({} photos).", galeriePhotoRepository.count());
    }

    private void save(String src, String alt, int ordre) {
        GaleriePhoto photo = new GaleriePhoto();
        photo.setImageUrl(src);
        photo.setAlt(alt);
        photo.setOrdreAffichage(ordre);
        photo.setActive(true);
        photo.setAfficherAccueil(HOME_SRC.contains(src));
        galeriePhotoRepository.save(photo);
    }
}
