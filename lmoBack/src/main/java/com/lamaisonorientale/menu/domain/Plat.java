package com.lamaisonorientale.menu.domain;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "plat")
public class Plat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

    @Column(name = "nom", nullable = false, length = 150)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prix", nullable = false, precision = 10, scale = 2)
    private BigDecimal prix;

    @Column(name = "disponible_emporter", nullable = false)
    private Boolean disponibleEmporter = true;

    @Column(name = "disponible_livraison", nullable = false)
    private Boolean disponibleLivraison = true;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "ordre_affichage", nullable = false)
    private Integer ordreAffichage = 0;

    @Column(name = "sous_section", length = 100)
    private String sousSection;

    @Column(name = "featured", nullable = false)
    private Boolean featured = false;

    public Long getId() {
        return id;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrix() {
        return prix;
    }

    public void setPrix(BigDecimal prix) {
        this.prix = prix;
    }

    public Boolean getDisponibleEmporter() {
        return disponibleEmporter;
    }

    public void setDisponibleEmporter(Boolean disponibleEmporter) {
        this.disponibleEmporter = disponibleEmporter;
    }

    public Boolean getDisponibleLivraison() {
        return disponibleLivraison;
    }

    public void setDisponibleLivraison(Boolean disponibleLivraison) {
        this.disponibleLivraison = disponibleLivraison;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getOrdreAffichage() {
        return ordreAffichage;
    }

    public void setOrdreAffichage(Integer ordreAffichage) {
        this.ordreAffichage = ordreAffichage;
    }

    public String getSousSection() {
        return sousSection;
    }

    public void setSousSection(String sousSection) {
        this.sousSection = sousSection;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }
}
