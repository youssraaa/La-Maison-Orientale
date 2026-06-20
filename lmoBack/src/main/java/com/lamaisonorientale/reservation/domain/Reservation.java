package com.lamaisonorientale.reservation.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

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
@Table(name = "reservation")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_reservation", nullable = false)
    private LocalDate dateReservation;

    @Column(name = "heure_reservation", nullable = false)
    private LocalTime heureReservation;

    @Column(name = "nb_personnes", nullable = false)
    private Integer nbPersonnes;

    @Column(name = "nom_client", nullable = false, length = 100)
    private String nomClient;

    @Column(name = "email_client", length = 255)
    private String emailClient;

    @Column(name = "telephone_client", nullable = false, length = 30)
    private String telephoneClient;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutReservation statut;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (statut == null) {
            statut = StatutReservation.EN_ATTENTE;
        }
    }

    public Long getId() {
        return id;
    }

    public LocalDate getDateReservation() {
        return dateReservation;
    }

    public void setDateReservation(LocalDate dateReservation) {
        this.dateReservation = dateReservation;
    }

    public LocalTime getHeureReservation() {
        return heureReservation;
    }

    public void setHeureReservation(LocalTime heureReservation) {
        this.heureReservation = heureReservation;
    }

    public Integer getNbPersonnes() {
        return nbPersonnes;
    }

    public void setNbPersonnes(Integer nbPersonnes) {
        this.nbPersonnes = nbPersonnes;
    }

    public String getNomClient() {
        return nomClient;
    }

    public void setNomClient(String nomClient) {
        this.nomClient = nomClient;
    }

    public String getEmailClient() {
        return emailClient;
    }

    public void setEmailClient(String emailClient) {
        this.emailClient = emailClient;
    }

    public String getTelephoneClient() {
        return telephoneClient;
    }

    public void setTelephoneClient(String telephoneClient) {
        this.telephoneClient = telephoneClient;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public StatutReservation getStatut() {
        return statut;
    }

    public void setStatut(StatutReservation statut) {
        this.statut = statut;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
