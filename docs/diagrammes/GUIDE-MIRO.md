# Guide Miro — Diagrammes de cas d'utilisation

Reste sur **Miro** : voici quoi modifier diagramme par diagramme.

---

## Outils Miro à utiliser

1. **Cadre / Rectangle** → limite du système (*Restaurant La Maison Orientale*)
2. **Forme ovale** → cas d'utilisation
3. **Bonhomme** (UML Actor) → acteurs
4. **Flèche pleine** → lien acteur ↔ cas d'utilisation
5. **Flèche pointillée** + étiquette → `<<include>>` ou `<<extend>>`

### Règle des flèches (important pour le correcteur)

| Relation | Style | Direction de la flèche |
|----------|-------|------------------------|
| Acteur → UC | pleine | acteur vers le cas |
| `<<include>>` | pointillée | **du cas principal vers le sous-cas** |
| `<<extend>>` | pointillée | **du cas optionnel vers le cas principal** |
| Héritage Client → Visiteur | pleine + triangle vide | Client vers Visiteur |

---

## Diagramme 1 — Administrateur

**Acteur :** Administrateur (à gauche, hors du cadre)

**Couleur ovales :** jaune (comme ton diagramme actuel)

### Cas principaux (liés à l'acteur)
- UC01 : consulter le tableau de bord
- UC02 : gérer les agents
- UC03 : consulter les notifications  ← **NOUVEAU**
- UC04 : gérer son profil  ← **ex-UC03, renuméroté**

### Sous-cas
| Depuis | Vers | Relation |
|--------|------|----------|
| UC01 | UC01-01 : générer un rapport d'activité PDF | <<extend>> |
| UC02 | UC02-01 : créer un compte agent | <<include>> |
| UC02 | UC02-02 : modifier un compte agent | <<include>> |
| UC02 | UC02-03 : supprimer un compte agent | <<include>> |
| UC02 | UC02-04 : renvoyer une invitation | <<include>> **NOUVEAU** |
| UC02 | UC02-05 : réinitialiser le mot de passe agent | <<include>> **NOUVEAU** |

### À supprimer / ne pas mettre
Réservations, commandes, carte, galerie, horaires → **Agent**, pas Admin.

### Note (sticky Miro, optionnel)
*L'administrateur ne gère pas les opérations du restaurant (rôle Agent).*

---

## Diagramme 2 — Agent

**Acteur :** Agent

**Couleur ovales :** jaune

### Cas principaux (12 au total)
1. UC01 : consulter le tableau de bord
2. UC02 : gérer les réservations
3. UC03 : gérer les horaires et fermetures
4. UC04 : gérer les commandes
5. UC05 : gérer la carte et les tarifs
6. UC06 : gérer la galerie photos
7. UC07 : gérer les informations et services du restaurant
8. UC08 : gérer les paramètres réservation / commande  ← **NOUVEAU**
9. UC09 : consulter les clients  ← **ex-UC08 dupliqué**
10. UC10 : gérer les messages
11. UC11 : consulter les notifications  ← **NOUVEAU**
12. UC12 : gérer son profil  ← **ex-UC08 dupliqué**

### Sous-cas et relations
| Depuis | Vers | Relation |
|--------|------|----------|
| UC01 | UC01-01 : générer un rapport d'activité PDF | <<extend>> |
| UC02 | UC02-01 à UC02-05 : consulter, suivre et marquer la présence | <<include>> |
| UC04 | UC04-01 à UC04-09 : consulter et traiter une commande | <<include>> |
| UC10 | UC10-01 : consulter un message | <<include>> |
| UC10 | UC10-02 : répondre à un message | <<include>> |

### Corrections par rapport à ton Miro actuel
- **Supprimer** les 3 UC08 en double → renuméroter en UC09, UC10, UC11, UC12
- **Supprimer** les actions « confirmer » et « refuser » côté agent : le client confirme ou annule ; l'agent marque « présenté » ou « absent » après le créneau
- **Fusionner** infos restaurant + services en un seul UC07

---

## Diagramme 3 — Visiteur & Client

**Acteurs :** Visiteur (haut) et Client (bas)  
**Héritage :** flèche triangle vide de **Client → Visiteur**

**Couleur ovales :** vert (comme ton diagramme actuel)

### Visiteur → cas d'utilisation
- UC01 : consulter le site
- UC02 : consulter la carte et les tarifs
- UC03 : consulter la galerie  ← **NOUVEAU (explicite)**
- UC04 : contacter le restaurant
- UC05 : réserver une table
- UC06 : gérer une réservation (via lien sécurisé)
- UC07 : passer une commande
- UC08 : s'inscrire

### Client → cas d'utilisation (en plus)
- UC09 : se connecter
- UC10 : consulter son espace client
- UC11 : consulter et gérer ses réservations
- UC12 : consulter ses commandes
- UC13 : consulter et gérer son profil

### Relations include / extend
| Depuis | Vers | Relation |
|--------|------|----------|
| UC05 | UC05-01 : consulter les disponibilités | <<include>> |
| UC05 | UC05-02 : confirmer une réservation | <<include>> |
| UC05-02 | UC05-03 : recevoir la confirmation par e-mail | <<include>> |
| UC06-01 | UC06 | <<extend>> *(flèche de UC06-01 vers UC06)* |
| UC06-02 | UC06 | <<extend>> |
| UC06-01 | UC05-03 | <<include>> |
| UC06-02 | UC05-03 | <<include>> |
| UC07 | UC07-01 à UC07-04 | <<include>> |
| UC07-04 | UC07-05 : recevoir la confirmation par e-mail | <<include>> |
| UC07-06 | UC07 | <<extend>> *(facture = optionnel)* |

Libellés sous-cas commande :
- UC07-01 : composer son panier
- UC07-02 : choisir le mode de commande
- UC07-03 : choisir le mode de paiement
- UC07-04 : confirmer une commande
- UC07-05 : recevoir la confirmation par e-mail
- UC07-06 : générer la facture

Sous-cas réservation (extend) :
- UC06-01 : modifier une réservation
- UC06-02 : annuler une réservation

### À supprimer
- **Messagerie client** (non implémentée dans le projet)
- Texte « inscription automatique après réservation » si présent dans le rapport

---

## Astuce Miro rapide

1. Duplique ton frame existant (Ctrl+D) pour garder le style
2. Modifie les textes des ovales un par un avec la liste ci-dessus
3. Supprime les ovales en trop
4. Vérifie **chaque flèche pointillée** : sens + étiquette `<<include>>` ou `<<extend>>`
5. Export : clic droit sur le frame → **Export image** → PNG pour le rapport
