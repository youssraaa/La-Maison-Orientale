package com.lamaisonorientale.horaire.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.horaire.domain.HoraireOuverture;
import com.lamaisonorientale.horaire.infrastructure.HoraireOuvertureRepository;

/**
 * Horaires par défaut (lundi fermé, mar–dim 12h–22h30) si la table est vide.
 */
@Component
@Order(21)
public class HoraireSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(HoraireSeeder.class);

    private final HoraireOuvertureRepository horaireRepository;

    public HoraireSeeder(HoraireOuvertureRepository horaireRepository) {
        this.horaireRepository = horaireRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (horaireRepository.count() > 0) {
            return;
        }
        for (short jour = 1; jour <= 7; jour++) {
            HoraireOuverture h = new HoraireOuverture();
            h.setJourSemaine(jour);
            h.setHeureOuverture(java.time.LocalTime.of(12, 0));
            h.setHeureFermeture(java.time.LocalTime.of(22, 30));
            h.setActif(jour != 1);
            horaireRepository.save(h);
        }
        log.info("Horaires d'ouverture par défaut initialisés.");
    }
}
