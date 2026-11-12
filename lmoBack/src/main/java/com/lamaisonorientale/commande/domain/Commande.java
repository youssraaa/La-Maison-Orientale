package com.lamaisonorientale.commande.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "commande")
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference", nullable = false, unique = true, length = 20)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_commande", nullable = false, length = 20)
    private ModeCommande modeCommande;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutCommande statut;

    @Column(name = "nom_client", nullable = false, length = 100)
    private String nomClient;

    @Column(name = "email_client", length = 255)
    private String emailClient;

    @Column(name = "telephone_client", nullable = false, length = 30)
    private String telephoneClient;

    @Column(name = "adresse_livraison", columnDefinition = "TEXT")
    private String adresseLivraison;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false, length = 30)
    private ModePaiement modePaiement;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "utilisateur_id")
    private Long utilisateurId;

    @Column(name = "gestion_token", nullable = false, unique = true, length = 64)
    private String gestionToken;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneCommande> lignes = new ArrayList<>();

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (statut == null) {
            statut = StatutCommande.CONFIRMEE;
        }
        if (modePaiement == null) {
            modePaiement = ModePaiement.CARTE_SUR_PLACE;
        }
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public ModeCommande getModeCommande() {
        return modeCommande;
    }

    public void setModeCommande(ModeCommande modeCommande) {
        this.modeCommande = modeCommande;
    }

    public StatutCommande getStatut() {
        return statut;
    }

    public void setStatut(StatutCommande statut) {
        this.statut = statut;
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

    public String getAdresseLivraison() {
        return adresseLivraison;
    }

    public void setAdresseLivraison(String adresseLivraison) {
        this.adresseLivraison = adresseLivraison;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public ModePaiement getModePaiement() {
        return modePaiement;
    }

    public void setModePaiement(ModePaiement modePaiement) {
        this.modePaiement = modePaiement;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Long getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(Long utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public String getGestionToken() {
        return gestionToken;
    }

    public void setGestionToken(String gestionToken) {
        this.gestionToken = gestionToken;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<LigneCommande> getLignes() {
        return lignes;
    }

    public void addLigne(LigneCommande ligne) {
        lignes.add(ligne);
        ligne.setCommande(this);
    }
}
