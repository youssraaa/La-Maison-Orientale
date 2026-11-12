# Corrections des diagrammes de cas d'utilisation

Diagrammes alignés sur le projet **La Maison Orientale** (frontend + backend).

Fichiers PlantUML : `01-administrateur.puml`, `02-agent.puml`, `03-visiteur-client.puml`  
Génération : [plantuml.com](https://www.plantuml.com/plantuml) ou extension VS Code PlantUML.

---

## 1. Administrateur

### Ce qui était correct
- UC01 tableau de bord, UC02 agents, UC03 profil

### Corrections apportées
| Problème | Correction |
|----------|------------|
| Flèches `<<include>>` inversées | Flèche **depuis** UC02 **vers** les sous-cas |
| Sous-cas agents incomplets | Ajout UC02-04 renvoyer invitation, UC02-05 réinitialiser MDP |
| PDF absent | UC01-01 `<<extend>>` générer rapport PDF |
| Notifications absentes | UC03 consulter les notifications |
| Profil mal numéroté | UC04 gérer son profil (ex-UC03) |

### À ne pas mettre sur ce diagramme
L'admin **n'a pas accès** (dans l'interface) à : réservations, commandes, carte, galerie, horaires → ce sont des cas **Agent**.

---

## 2. Agent

### Corrections apportées
| Problème | Correction |
|----------|------------|
| **4× UC08** (numérotation dupliquée) | Renumérotation UC01 → UC12 |
| UC02-03 « annuler » | **Refuser** une réservation (confirmé / refusé dans l'app) |
| « Services » séparé des infos | Fusion UC07 infos **et** services |
| Paramètres résa/commande absents | UC08 dédié |
| Clients + messages mélangés | UC09 clients (lecture seule), UC10 messages avec sous-cas |
| Notifications absentes | UC11 |
| Profil en double UC08 | UC12 gérer son profil |

---

## 3. Visiteur & Client

### Corrections par rapport à ton diagramme Miro

| Problème sur ton diagramme | Correction |
|----------------------------|------------|
| **Galerie absente** | Ajout **UC03 : consulter la galerie** (page `/galerie`) |
| **UC21 « consulte »** (faute) | **UC12 : consulter ses commandes** |
| **Numérotation UC10 en double** | UC07 = e-mail réservation ; UC15 = notifications in-app |
| **Messages / notifications mélangés** | **UC14** = messages envoyés par le client ; **UC15** = alertes reçues (cloche) |
| **Flèches `<<extend>>` inversées** | Flèche **du sous-cas vers le principal** (ex. UC06-01 → UC06) |
| **Profil + livraison** | UC13-01 `<<extend>>` : enregistrement auto adresse/téléphone si commande livraison connectée |
| **Notifications in-app absentes** | UC15-01 alimenté par résa, commande, réponse restaurant (si client connecté) |

### Cas implémentés dans le projet

| UC | Fonctionnalité | Route / remarque |
|----|----------------|------------------|
| UC01–UC04 | Site, carte, galerie, contact | `/`, `/menu`, `/galerie`, `/contact` |
| UC05–UC06 | Réserver, gérer (lien token) | `/reservation`, `/reservation/gerer/:token` |
| UC08 | Commander | `/commander` |
| UC09–UC10 | Inscription, connexion | `/inscription`, `/connexion` |
| UC11–UC13 | Réservations, commandes, profil | `/mon-compte/...` |
| UC14 | Messages (envoi + historique) | `/mon-compte/messages` (onglet Messages) |
| UC15 | Notifications (cloche) | `/mon-compte/messages?onglet=notifications` |

### Différence Messages vs Notifications

- **Messages (UC14)** : le client **écrit** au restaurant (formulaire contact + historique).
- **Notifications (UC15)** : le restaurant **informe** le client (réservation confirmée/modifiée/annulée, commande confirmée, réponse à un message). Badge cloche dans le menu.

### Héritage Visiteur → Client

Correct : le client conserve toutes les actions visiteur + espace connecté.

---

## Rappel des rôles dans le projet

| Rôle | Accès principal |
|------|-----------------|
| **Visiteur** | Site public, réservation, commande, contact |
| **Client** | + espace `/mon-compte` |
| **Agent** | Back-office opérationnel `/admin/*` (sauf agents) |
| **Administrateur** | Dashboard, agents, notifications, profil |
