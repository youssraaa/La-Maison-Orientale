package com.lamaisonorientale.horaire.domain;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "horaire_ouverture")
public class HoraireOuverture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "jour_semaine", nullable = false)
    private Short jourSemaine;

    @Column(name = "heure_ouverture", nullable = false)
    private LocalTime heureOuverture;

    @Column(name = "heure_fermeture", nullable = false)
    private LocalTime heureFermeture;

    @Column(nullable = false)
    private Boolean actif = true;

    public Long getId() {
        return id;
    }

    public Short getJourSemaine() {
        return jourSemaine;
    }

    public void setJourSemaine(Short jourSemaine) {
        this.jourSemaine = jourSemaine;
    }

    public LocalTime getHeureOuverture() {
        return heureOuverture;
    }

    public void setHeureOuverture(LocalTime heureOuverture) {
        this.heureOuverture = heureOuverture;
    }

    public LocalTime getHeureFermeture() {
        return heureFermeture;
    }

    public void setHeureFermeture(LocalTime heureFermeture) {
        this.heureFermeture = heureFermeture;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }
}
