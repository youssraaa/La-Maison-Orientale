package com.lamaisonorientale.horaire.domain;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "fermeture_exceptionnelle")
public class FermetureExceptionnelle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_fermeture", nullable = false, unique = true)
    private LocalDate dateFermeture;

    @Column(length = 255)
    private String motif;

    public Long getId() {
        return id;
    }

    public LocalDate getDateFermeture() {
        return dateFermeture;
    }

    public void setDateFermeture(LocalDate dateFermeture) {
        this.dateFermeture = dateFermeture;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }
}
