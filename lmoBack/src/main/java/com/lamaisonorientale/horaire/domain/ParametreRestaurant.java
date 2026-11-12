package com.lamaisonorientale.horaire.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parametre_restaurant")
public class ParametreRestaurant {

    @Id
    @Column(length = 80)
    private String cle;

    @Column(nullable = false, length = 500)
    private String valeur;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public String getCle() {
        return cle;
    }

    public void setCle(String cle) {
        this.cle = cle;
    }

    public String getValeur() {
        return valeur;
    }

    public void setValeur(String valeur) {
        this.valeur = valeur;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
