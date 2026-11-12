package com.lamaisonorientale.galerie.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "galerie_photo")
public class GaleriePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "alt", length = 255)
    private String alt;

    @Column(name = "ordre_affichage", nullable = false)
    private Integer ordreAffichage = 0;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "afficher_accueil", nullable = false)
    private Boolean afficherAccueil = false;

    public Long getId() {
        return id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAlt() {
        return alt;
    }

    public void setAlt(String alt) {
        this.alt = alt;
    }

    public Integer getOrdreAffichage() {
        return ordreAffichage;
    }

    public void setOrdreAffichage(Integer ordreAffichage) {
        this.ordreAffichage = ordreAffichage;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getAfficherAccueil() {
        return afficherAccueil;
    }

    public void setAfficherAccueil(Boolean afficherAccueil) {
        this.afficherAccueil = afficherAccueil;
    }
}
