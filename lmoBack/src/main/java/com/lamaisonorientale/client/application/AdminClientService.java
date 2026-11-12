package com.lamaisonorientale.client.application;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.client.dto.AdminClientDetailDto;
import com.lamaisonorientale.client.dto.AdminClientDetailDto.ClientCommandeItemDto;
import com.lamaisonorientale.client.dto.AdminClientDetailDto.ClientMessageItemDto;
import com.lamaisonorientale.client.dto.AdminClientDetailDto.ClientReservationItemDto;
import com.lamaisonorientale.client.dto.AdminClientDto;
import com.lamaisonorientale.commande.domain.Commande;
import com.lamaisonorientale.commande.infrastructure.CommandeRepository;
import com.lamaisonorientale.demande.domain.DemandeClient;
import com.lamaisonorientale.demande.infrastructure.DemandeClientRepository;
import com.lamaisonorientale.reservation.domain.Reservation;
import com.lamaisonorientale.reservation.infrastructure.ReservationRepository;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@Service
public class AdminClientService {

    private final ReservationRepository reservationRepository;
    private final CommandeRepository commandeRepository;
    private final DemandeClientRepository demandeClientRepository;
    private final UtilisateurRepository utilisateurRepository;

    public AdminClientService(
            ReservationRepository reservationRepository,
            CommandeRepository commandeRepository,
            DemandeClientRepository demandeClientRepository,
            UtilisateurRepository utilisateurRepository) {
        this.reservationRepository = reservationRepository;
        this.commandeRepository = commandeRepository;
        this.demandeClientRepository = demandeClientRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminClientDto> listClients() {
        Map<String, ClientAggregate> aggregates = new LinkedHashMap<>();

        for (Utilisateur user : utilisateurRepository.findByRoleOrderByNomAscEmailAsc(RoleUtilisateur.CLIENT)) {
            String key = clientKey(user.getEmail(), user.getTelephone(), user.getNom());
            ClientAggregate aggregate = aggregates.computeIfAbsent(key, k -> new ClientAggregate());
            aggregate.nom = formatUserName(user);
            aggregate.email = user.getEmail();
            aggregate.telephone = user.getTelephone();
            aggregate.datePremiereActivite = user.getCreatedAt();
            aggregate.derniereActivite = user.getCreatedAt();
            aggregate.adresseLivraison = user.getAdresseLivraison();
        }

        for (Reservation reservation : reservationRepository.findAllByOrderByDateReservationDescHeureReservationAsc()) {
            String key = clientKey(reservation.getEmailClient(), reservation.getTelephoneClient(), reservation.getNomClient());
            ClientAggregate aggregate = aggregates.get(key);
            if (aggregate == null) continue;
            aggregate.nom = pickName(aggregate.nom, reservation.getNomClient());
            aggregate.email = pickText(aggregate.email, reservation.getEmailClient());
            aggregate.telephone = pickText(aggregate.telephone, reservation.getTelephoneClient());
            aggregate.nbReservations++;
            aggregate.derniereActivite = maxInstant(aggregate.derniereActivite, reservation.getCreatedAt());
            aggregate.datePremiereActivite = minInstant(aggregate.datePremiereActivite, reservation.getCreatedAt());
        }

        for (Commande commande : commandeRepository.findAllByOrderByCreatedAtDesc()) {
            String key = clientKey(commande.getEmailClient(), commande.getTelephoneClient(), commande.getNomClient());
            ClientAggregate aggregate = aggregates.get(key);
            if (aggregate == null) continue;
            aggregate.nom = pickName(aggregate.nom, commande.getNomClient());
            aggregate.email = pickText(aggregate.email, commande.getEmailClient());
            aggregate.telephone = pickText(aggregate.telephone, commande.getTelephoneClient());
            aggregate.nbCommandes++;
            aggregate.derniereActivite = maxInstant(aggregate.derniereActivite, commande.getCreatedAt());
            aggregate.datePremiereActivite = minInstant(aggregate.datePremiereActivite, commande.getCreatedAt());
            if (StringUtils.hasText(commande.getAdresseLivraison())) {
                aggregate.adresseLivraison = commande.getAdresseLivraison().trim();
            }
        }

        for (DemandeClient demande : demandeClientRepository.findAllByOrderByCreatedAtDesc()) {
            String key = clientKey(demande.getEmail(), demande.getTelephone(), demande.getNom());
            ClientAggregate aggregate = aggregates.get(key);
            if (aggregate == null) continue;
            aggregate.nom = pickName(aggregate.nom, demande.getNom());
            aggregate.email = pickText(aggregate.email, demande.getEmail());
            aggregate.telephone = pickText(aggregate.telephone, demande.getTelephone());
            aggregate.nbMessages++;
            aggregate.derniereActivite = maxInstant(aggregate.derniereActivite, demande.getCreatedAt());
            aggregate.datePremiereActivite = minInstant(aggregate.datePremiereActivite, demande.getCreatedAt());
        }

        List<AdminClientDto> rows = new ArrayList<>();
        for (ClientAggregate aggregate : aggregates.values()) {
            rows.add(new AdminClientDto(
                    aggregate.nom,
                    aggregate.email,
                    aggregate.telephone,
                    aggregate.nbReservations,
                    aggregate.nbCommandes,
                    aggregate.nbMessages,
                    aggregate.datePremiereActivite,
                    aggregate.derniereActivite,
                    aggregate.adresseLivraison));
        }

        rows.sort(Comparator.comparing(AdminClientDto::derniereActivite, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(AdminClientDto::nom, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
        return rows;
    }

    private String formatUserName(Utilisateur user) {
        String fullName = String.join(
                " ",
                java.util.stream.Stream.of(user.getPrenom(), user.getNom())
                        .filter(StringUtils::hasText)
                        .map(String::trim)
                        .toList());
        return StringUtils.hasText(fullName) ? fullName : user.getEmail();
    }

    @Transactional(readOnly = true)
    public AdminClientDetailDto getClientDetail(String email, String telephone, String nom) {
        List<Reservation> reservations = loadReservations(email, telephone, nom);
        List<Commande> commandes = loadCommandes(email, telephone, nom);
        List<DemandeClient> messages = loadMessages(email, telephone, nom);

        String resolvedNom = pickNameFromList(
                reservations.stream().map(Reservation::getNomClient).toList(),
                messages.stream().map(DemandeClient::getNom).toList(),
                nom);
        String resolvedEmail = pickText(
                email,
                pickTextFromList(
                        reservations.stream().map(Reservation::getEmailClient).toList(),
                        messages.stream().map(DemandeClient::getEmail).toList()));
        String resolvedPhone = pickText(
                telephone,
                pickTextFromList(
                        reservations.stream().map(Reservation::getTelephoneClient).toList(),
                        messages.stream().map(DemandeClient::getTelephone).toList()));

        List<ClientReservationItemDto> reservationItems = reservations.stream()
                .map(r -> new ClientReservationItemDto(
                        r.getId(),
                        r.getDateReservation(),
                        r.getHeureReservation(),
                        r.getNbPersonnes(),
                        r.getStatut().name(),
                        r.getCreatedAt()))
                .toList();

        List<ClientCommandeItemDto> commandeItems = commandes.stream()
                .map(c -> new ClientCommandeItemDto(
                        c.getId(),
                        c.getReference(),
                        c.getModeCommande().name(),
                        c.getStatut().name(),
                        c.getTotal(),
                        c.getCreatedAt()))
                .toList();

        List<ClientMessageItemDto> messageItems = messages.stream()
                .map(m -> new ClientMessageItemDto(
                        m.getId(),
                        m.getSujet(),
                        m.getMessage(),
                        m.getStatut().name(),
                        m.getCreatedAt()))
                .toList();

        return new AdminClientDetailDto(resolvedNom, resolvedEmail, resolvedPhone, reservationItems, commandeItems, messageItems);
    }

    private List<Reservation> loadReservations(String email, String telephone, String nom) {
        if (StringUtils.hasText(email)) {
            return reservationRepository.findByEmailClientIgnoreCaseOrderByCreatedAtDesc(email.trim());
        }
        if (StringUtils.hasText(telephone)) {
            return reservationRepository.findByTelephoneClientOrderByCreatedAtDesc(telephone.trim());
        }
        if (!StringUtils.hasText(nom)) {
            throw new IllegalArgumentException("Indiquez un e-mail, un téléphone ou un nom.");
        }
        return reservationRepository.findAllByOrderByDateReservationDescHeureReservationAsc().stream()
                .filter(r -> nom.trim().equalsIgnoreCase(r.getNomClient()))
                .toList();
    }

    private List<Commande> loadCommandes(String email, String telephone, String nom) {
        if (StringUtils.hasText(email)) {
            return commandeRepository.findByEmailClientIgnoreCaseOrderByCreatedAtDesc(email.trim());
        }
        if (StringUtils.hasText(telephone)) {
            return commandeRepository.findAllByOrderByCreatedAtDesc().stream()
                    .filter(c -> telephone.trim().equals(c.getTelephoneClient()))
                    .toList();
        }
        if (!StringUtils.hasText(nom)) {
            return List.of();
        }
        return commandeRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(c -> nom.trim().equalsIgnoreCase(c.getNomClient()))
                .toList();
    }

    private List<DemandeClient> loadMessages(String email, String telephone, String nom) {
        if (StringUtils.hasText(email)) {
            return demandeClientRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email.trim());
        }
        if (StringUtils.hasText(telephone)) {
            return demandeClientRepository.findByTelephoneOrderByCreatedAtDesc(telephone.trim());
        }
        if (!StringUtils.hasText(nom)) {
            return List.of();
        }
        return demandeClientRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(d -> nom.trim().equalsIgnoreCase(d.getNom()))
                .toList();
    }

    private String pickNameFromList(List<String> a, List<String> b, String fallback) {
        for (String value : a) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        for (String value : b) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return StringUtils.hasText(fallback) ? fallback.trim() : null;
    }

    private String pickTextFromList(List<String> a, List<String> b) {
        for (String value : a) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        for (String value : b) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private String clientKey(String email, String telephone, String nom) {
        if (StringUtils.hasText(email)) {
            return "e:" + email.trim().toLowerCase(Locale.ROOT);
        }
        if (StringUtils.hasText(telephone)) {
            return "p:" + normalizePhone(telephone);
        }
        return "n:" + (StringUtils.hasText(nom) ? nom.trim().toLowerCase(Locale.ROOT) : "inconnu");
    }

    private String normalizePhone(String phone) {
        return phone.replaceAll("\\D", "");
    }

    private String pickName(String current, String candidate) {
        if (!StringUtils.hasText(candidate)) {
            return current;
        }
        if (!StringUtils.hasText(current) || candidate.length() > current.length()) {
            return candidate.trim();
        }
        return current;
    }

    private String pickText(String current, String candidate) {
        if (!StringUtils.hasText(candidate)) {
            return current;
        }
        if (!StringUtils.hasText(current)) {
            return candidate.trim();
        }
        return current;
    }

    private Instant maxInstant(Instant current, Instant candidate) {
        if (current == null) {
            return candidate;
        }
        if (candidate == null) {
            return current;
        }
        return candidate.isAfter(current) ? candidate : current;
    }

    private Instant minInstant(Instant current, Instant candidate) {
        if (current == null) {
            return candidate;
        }
        if (candidate == null) {
            return current;
        }
        return candidate.isBefore(current) ? candidate : current;
    }

    private static final class ClientAggregate {
        private String nom;
        private String email;
        private String telephone;
        private int nbReservations;
        private int nbCommandes;
        private int nbMessages;
        private Instant datePremiereActivite;
        private Instant derniereActivite;
        private String adresseLivraison;
    }
}
