package com.lamaisonorientale.demande.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "demande_client")
public class DemandeClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_demande", nullable = false, length = 30)
    private TypeDemande typeDemande;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 255)
    private String email;

    @Column(length = 30)
    private String telephone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutDemande statut;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (statut == null) {
            statut = StatutDemande.NOUVELLE;
        }
    }

    public Long getId() {
        return id;
    }

    public TypeDemande getTypeDemande() {
        return typeDemande;
    }

    public void setTypeDemande(TypeDemande typeDemande) {
        this.typeDemande = typeDemande;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public StatutDemande getStatut() {
        return statut;
    }

    public void setStatut(StatutDemande statut) {
        this.statut = statut;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
