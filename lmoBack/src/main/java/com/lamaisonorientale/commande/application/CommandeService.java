package com.lamaisonorientale.commande.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lamaisonorientale.commande.domain.Commande;
import com.lamaisonorientale.commande.domain.LigneCommande;
import com.lamaisonorientale.commande.domain.ModeCommande;
import com.lamaisonorientale.commande.domain.ModePaiement;
import com.lamaisonorientale.commande.domain.StatutCommande;
import com.lamaisonorientale.commande.dto.AdminCommandeDto;
import com.lamaisonorientale.commande.dto.CommandeResponseDto;
import com.lamaisonorientale.commande.dto.PublicCommandeDetailDto;
import com.lamaisonorientale.commande.dto.SubmitCommandeRequest;
import com.lamaisonorientale.commande.infrastructure.CommandeRepository;
import com.lamaisonorientale.common.util.SecureTokenGenerator;
import com.lamaisonorientale.email.EmailDeliveryException;
import com.lamaisonorientale.email.EmailService;
import com.lamaisonorientale.horaire.application.RestaurantSettingsService;
import com.lamaisonorientale.menu.domain.Plat;
import com.lamaisonorientale.menu.infrastructure.PlatRepository;
import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.notification.domain.NotificationType;
import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.infrastructure.UtilisateurRepository;

@Service
public class CommandeService {

    private static final Logger log = LoggerFactory.getLogger(CommandeService.class);
    private static final Set<StatutCommande> CANCELLABLE =
            EnumSet.of(StatutCommande.EN_ATTENTE, StatutCommande.CONFIRMEE);

    private final CommandeRepository commandeRepository;
    private final PlatRepository platRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final RestaurantSettingsService restaurantSettingsService;
    private final DeliveryZoneService deliveryZoneService;

    @Value("${lmo.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public CommandeService(
            CommandeRepository commandeRepository,
            PlatRepository platRepository,
            UtilisateurRepository utilisateurRepository,
            EmailService emailService,
            NotificationService notificationService,
            RestaurantSettingsService restaurantSettingsService,
            DeliveryZoneService deliveryZoneService) {
        this.commandeRepository = commandeRepository;
        this.platRepository = platRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.restaurantSettingsService = restaurantSettingsService;
        this.deliveryZoneService = deliveryZoneService;
    }

    @Transactional(noRollbackFor = EmailDeliveryException.class)
    public CommandeResponseDto submit(SubmitCommandeRequest request) {
        ModeCommande mode = parseMode(request.mode());
        if (mode == ModeCommande.LIVRAISON && !StringUtils.hasText(request.adresseLivraison())) {
            throw new IllegalArgumentException("L'adresse de livraison est obligatoire.");
        }
        if (mode == ModeCommande.LIVRAISON) {
            deliveryZoneService.assertDeliverable(request.adresseLivraison());
        }

        Commande commande = new Commande();
        commande.setReference(nextReference());
        commande.setModeCommande(mode);
        commande.setStatut(StatutCommande.CONFIRMEE);
        commande.setNomClient(request.nom().trim());
        commande.setEmailClient(trimToNull(request.email()));
        commande.setTelephoneClient(request.telephone().trim());
        commande.setAdresseLivraison(
                mode == ModeCommande.LIVRAISON ? request.adresseLivraison().trim() : null);
        commande.setCommentaire(trimToNull(request.commentaire()));
        ModePaiement modePaiement = parseModePaiement(request.modePaiement());
        if (mode == ModeCommande.LIVRAISON && modePaiement != ModePaiement.ESPECES) {
            throw new IllegalArgumentException("La livraison se règle uniquement en espèces.");
        }
        if (mode == ModeCommande.EMPORTER
                && modePaiement != ModePaiement.ESPECES
                && modePaiement != ModePaiement.CARTE_SUR_PLACE) {
            throw new IllegalArgumentException("Mode de paiement invalide pour l'emporter.");
        }
        commande.setModePaiement(modePaiement);
        commande.setGestionToken(SecureTokenGenerator.newToken());
        commande.setUtilisateurId(resolveClientUserId());

        BigDecimal total = BigDecimal.ZERO;
        for (SubmitCommandeRequest.LigneRequest ligneReq : request.lignes()) {
            Plat plat = platRepository
                    .findById(ligneReq.platId())
                    .orElseThrow(() -> new IllegalArgumentException("Plat introuvable."));
            if (!plat.getDisponibleEmporter() && mode == ModeCommande.EMPORTER) {
                throw new IllegalArgumentException("« " + plat.getNom() + " » n'est plus disponible à emporter.");
            }
            if (!plat.getDisponibleLivraison() && mode == ModeCommande.LIVRAISON) {
                throw new IllegalArgumentException("« " + plat.getNom() + " » n'est plus disponible en livraison.");
            }

            LigneCommande ligne = new LigneCommande();
            ligne.setPlatId(plat.getId());
            ligne.setNomPlat(plat.getNom());
            ligne.setPrixUnitaire(plat.getPrix());
            ligne.setQuantite(ligneReq.quantite());
            commande.addLigne(ligne);

            total = total.add(
                    plat.getPrix().multiply(BigDecimal.valueOf(ligneReq.quantite())));
        }

        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le panier est vide.");
        }

        if (mode == ModeCommande.LIVRAISON) {
            BigDecimal minimum =
                    restaurantSettingsService.getDecimal("montant_minimum_livraison_eur", new BigDecimal("25.00"));
            if (total.compareTo(minimum) < 0) {
                throw new IllegalArgumentException(
                        "Montant minimum de " + minimum.setScale(2, RoundingMode.HALF_UP) + " € pour la livraison.");
            }
            BigDecimal fraisLivraison =
                    restaurantSettingsService.getDecimal("frais_livraison_eur", new BigDecimal("2.50"));
            if (fraisLivraison.compareTo(BigDecimal.ZERO) > 0) {
                total = total.add(fraisLivraison);
            }
        }

        commande.setTotal(total.setScale(2, RoundingMode.HALF_UP));
        Commande saved = commandeRepository.save(commande);
        syncClientProfileFromDeliveryOrder(saved.getUtilisateurId(), mode, request);
        String manageUrl = buildManageUrl(saved.getGestionToken());

        try {
            emailService.sendOrderNotificationToRestaurant(
                    saved.getId(),
                    saved.getReference(),
                    saved.getNomClient(),
                    saved.getEmailClient(),
                    saved.getTelephoneClient(),
                    saved.getModeCommande().name(),
                    formatModePaiement(saved.getModePaiement()),
                    saved.getTotal(),
                    saved.getAdresseLivraison(),
                    saved.getCommentaire(),
                    saved.getCreatedAt());
        } catch (EmailDeliveryException ex) {
            log.warn("Notification restaurant non envoyée pour commande #{} : {}", saved.getId(), ex.getMessage());
        }

        try {
            emailService.sendOrderConfirmationToClient(
                    saved.getEmailClient(),
                    saved.getNomClient(),
                    saved.getReference(),
                    saved.getModeCommande().name(),
                    formatModePaiement(saved.getModePaiement()),
                    saved.getTotal(),
                    manageUrl);
        } catch (EmailDeliveryException ex) {
            log.warn("Confirmation client non envoyée pour commande #{} : {}", saved.getId(), ex.getMessage());
        }

        notificationService.notifyStaff(
                NotificationType.NOUVELLE_COMMANDE,
                "Nouvelle commande",
                saved.getReference()
                        + " · "
                        + saved.getNomClient()
                        + " · "
                        + saved.getTotal()
                        + " €",
                "/admin/commandes");

        notifyLinkedClientCommande(saved);

        return toResponse(saved, manageUrl);
    }

    @Transactional(readOnly = true)
    public PublicCommandeDetailDto getByToken(String token) {
        Commande commande = commandeRepository
                .findByGestionToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable."));
        return toPublicDetail(commande, false);
    }

    @Transactional
    public PublicCommandeDetailDto cancelByToken(String token) {
        Commande commande = commandeRepository
                .findByGestionToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable."));
        if (!CANCELLABLE.contains(commande.getStatut())) {
            throw new IllegalArgumentException("Cette commande ne peut plus être annulée.");
        }

        commande.setStatut(StatutCommande.ANNULEE);
        Commande saved = commandeRepository.save(commande);

        try {
            emailService.sendOrderCancellationToClient(
                    saved.getEmailClient(), saved.getNomClient(), saved.getReference());
        } catch (EmailDeliveryException ex) {
            log.warn("E-mail annulation commande non envoyé : {}", ex.getMessage());
        }

        return toPublicDetail(saved, false);
    }

    @Transactional(readOnly = true)
    public List<PublicCommandeDetailDto> listForUser(Long userId) {
        return commandeRepository.findByUtilisateurIdOrderByCreatedAtDesc(userId).stream()
                .map(c -> toPublicDetail(c, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminCommandeDto getAdminById(Long id) {
        Commande commande = commandeRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable."));
        return toAdminDto(commande);
    }

    @Transactional(readOnly = true)
    public List<AdminCommandeDto> listAllAdmin(String date) {
        List<Commande> rows;
        if (date != null && !date.isBlank()) {
            try {
                LocalDate filterDate = LocalDate.parse(date.trim());
                rows = commandeRepository.findByDateBrussels(filterDate);
            } catch (Exception ex) {
                rows = commandeRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            rows = commandeRepository.findAllByOrderByCreatedAtDesc();
        }
        return rows.stream()
                .map(this::toAdminDto)
                .toList();
    }

    @Transactional
    public AdminCommandeDto updateStatut(Long id, String statutRaw) {
        StatutCommande statut;
        try {
            statut = StatutCommande.valueOf(statutRaw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Statut invalide.");
        }

        Commande commande = commandeRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable."));
        StatutCommande previous = commande.getStatut();
        commande.setStatut(statut);
        Commande saved = commandeRepository.save(commande);
        if (previous != statut) {
            notifyClientOrderStatus(saved, statut);
            try {
                emailService.sendOrderStatusToClient(
                        saved.getEmailClient(),
                        saved.getNomClient(),
                        saved.getReference(),
                        saved.getModeCommande().name(),
                        statut.name());
            } catch (EmailDeliveryException ex) {
                log.warn("E-mail statut commande non envoyé pour #{} : {}", saved.getId(), ex.getMessage());
            }
        }
        return toAdminDto(saved);
    }

    private String nextReference() {
        String day = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String prefix = "CMD-" + day + "-";
        long count = commandeRepository.countByReferenceStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    private void syncClientProfileFromDeliveryOrder(
            Long userId, ModeCommande mode, SubmitCommandeRequest request) {
        if (userId == null || mode != ModeCommande.LIVRAISON) {
            return;
        }

        utilisateurRepository.findById(userId).ifPresent(user -> {
            if (user.getRole() != RoleUtilisateur.CLIENT) {
                return;
            }

            user.setTelephone(request.telephone().trim());

            String street = buildDeliveryStreetLine(
                    trimToNull(request.adresseLivraisonRue()), trimToNull(request.adresseLivraisonNumero()));
            String cp = trimToNull(request.codePostalLivraison());
            String ville = trimToNull(request.villeLivraison());

            if ((street == null || cp == null || ville == null)
                    && StringUtils.hasText(request.adresseLivraison())) {
                ComposedDeliveryAddress parsed = parseComposedDeliveryAddress(request.adresseLivraison().trim());
                if (street == null) {
                    street = parsed.street();
                }
                if (cp == null) {
                    cp = parsed.postalCode();
                }
                if (ville == null) {
                    ville = parsed.city();
                }
            }

            if (street != null) {
                user.setAdresseLivraison(street);
            }
            if (cp != null) {
                user.setCodePostalLivraison(cp);
            }
            if (ville != null) {
                user.setVilleLivraison(ville);
            }

            utilisateurRepository.save(user);
        });
    }

    private record ComposedDeliveryAddress(String street, String postalCode, String city) {}

    private static ComposedDeliveryAddress parseComposedDeliveryAddress(String composed) {
        String[] parts = composed.split(",");
        String street = parts.length > 0 ? parts[0].trim() : null;
        String postalCode = parts.length > 1 ? parts[1].trim() : null;
        String city = null;
        if (parts.length > 2) {
            city = String.join(",", java.util.Arrays.copyOfRange(parts, 2, parts.length)).trim();
        }
        return new ComposedDeliveryAddress(
                StringUtils.hasText(street) ? street : null,
                StringUtils.hasText(postalCode) ? postalCode : null,
                StringUtils.hasText(city) ? city : null);
    }

    private static String buildDeliveryStreetLine(String rue, String numero) {
        if (!StringUtils.hasText(rue) && !StringUtils.hasText(numero)) {
            return null;
        }
        if (!StringUtils.hasText(rue)) {
            return numero;
        }
        if (!StringUtils.hasText(numero)) {
            return rue;
        }
        return rue + " " + numero;
    }

    private void notifyLinkedClientCommande(Commande commande) {
        String modeLabel =
                commande.getModeCommande() == ModeCommande.LIVRAISON ? "livraison" : "emporter";
        String message =
                commande.getReference() + " · " + commande.getTotal() + " € · " + modeLabel;
        String lien = "/mon-compte/commandes";
        Long userId = commande.getUtilisateurId();
        if (userId != null) {
            notificationService.notifyUser(
                    userId, NotificationType.COMMANDE_CONFIRMEE, "Commande confirmée", message, lien);
            return;
        }
        notificationService.notifyClientByEmail(
                commande.getEmailClient(),
                NotificationType.COMMANDE_CONFIRMEE,
                "Commande confirmée",
                message,
                lien);
    }

    private void notifyClientOrderStatus(Commande commande, StatutCommande statut) {
        String title;
        String statusMessage;
        switch (statut) {
            case EN_PREPARATION -> {
                title = "Commande en préparation";
                statusMessage = "Votre commande est en cours de préparation.";
            }
            case PRETE -> {
                title = "Commande prête";
                statusMessage = commande.getModeCommande() == ModeCommande.LIVRAISON
                        ? "Votre commande est prête et sera bientôt remise au livreur."
                        : "Votre commande est prête à être retirée au restaurant.";
            }
            case LIVREE -> {
                title = commande.getModeCommande() == ModeCommande.LIVRAISON
                        ? "Commande livrée"
                        : "Commande remise";
                statusMessage = commande.getModeCommande() == ModeCommande.LIVRAISON
                        ? "Votre commande vient d'être livrée."
                        : "Votre commande vous a été remise. Merci !";
            }
            case REMIS -> {
                title = "Commande remise";
                statusMessage = "Votre commande vous a été remise. Merci !";
            }
            case ANNULEE -> {
                title = "Commande annulée";
                statusMessage = "Votre commande a été annulée par le restaurant.";
            }
            default -> {
                return;
            }
        }

        String message = commande.getReference() + " · " + statusMessage;
        String lien = "/mon-compte/commandes";
        Long userId = commande.getUtilisateurId();
        if (userId != null) {
            notificationService.notifyUser(
                    userId, NotificationType.COMMANDE_CONFIRMEE, title, message, lien);
            return;
        }
        notificationService.notifyClientByEmail(
                commande.getEmailClient(), NotificationType.COMMANDE_CONFIRMEE, title, message, lien);
    }

    private Long resolveClientUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return utilisateurRepository
                .findByEmailIgnoreCase(auth.getName())
                .filter(u -> u.getRole() == RoleUtilisateur.CLIENT)
                .map(Utilisateur::getId)
                .orElse(null);
    }

    private ModeCommande parseMode(String raw) {
        if (!StringUtils.hasText(raw)) {
            throw new IllegalArgumentException("Mode de commande obligatoire.");
        }
        try {
            return ModeCommande.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Mode de commande invalide.");
        }
    }

    private ModePaiement parseModePaiement(String raw) {
        if (!StringUtils.hasText(raw)) {
            return ModePaiement.CARTE_SUR_PLACE;
        }
        try {
            return ModePaiement.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Mode de paiement invalide.");
        }
    }

    private static String formatModePaiement(ModePaiement mode) {
        if (mode == null) {
            return "Carte sur place";
        }
        return switch (mode) {
            case ESPECES -> "Espèces";
            case BANCONTACT -> "Bancontact en ligne";
            case PAYPAL -> "PayPal";
            case CARTE_SUR_PLACE -> "Carte sur place";
        };
    }

    private String buildManageUrl(String token) {
        return frontendUrl.replaceAll("/$", "") + "/commande/gerer/" + token;
    }

    private static String confirmationMessage(ModePaiement modePaiement) {
        if (modePaiement == ModePaiement.BANCONTACT) {
            return "Votre commande est confirmée. Le paiement Bancontact sera finalisé en ligne.";
        }
        if (modePaiement == ModePaiement.PAYPAL) {
            return "Votre commande est confirmée. Le paiement PayPal sera finalisé en ligne.";
        }
        if (modePaiement == ModePaiement.ESPECES) {
            return "Votre commande est confirmée. Règlement en espèces au retrait ou à la livraison.";
        }
        return "Votre commande est confirmée. Paiement par carte au retrait ou à la livraison.";
    }

    private CommandeResponseDto toResponse(Commande commande, String manageUrl) {
        return new CommandeResponseDto(
                commande.getId(),
                commande.getReference(),
                confirmationMessage(commande.getModePaiement()),
                commande.getModeCommande().name(),
                commande.getStatut().name(),
                commande.getTotal(),
                commande.getGestionToken(),
                manageUrl,
                commande.getCreatedAt(),
                mapLignesResponse(commande));
    }

    private PublicCommandeDetailDto toPublicDetail(Commande commande, boolean includeManageToken) {
        return new PublicCommandeDetailDto(
                commande.getId(),
                commande.getReference(),
                commande.getModeCommande().name(),
                commande.getStatut().name(),
                commande.getNomClient(),
                commande.getTotal(),
                commande.getAdresseLivraison(),
                commande.getCommentaire(),
                commande.getModePaiement() != null ? commande.getModePaiement().name() : null,
                commande.getCreatedAt(),
                mapLignesPublic(commande),
                CANCELLABLE.contains(commande.getStatut()),
                includeManageToken ? commande.getGestionToken() : null);
    }

    private AdminCommandeDto toAdminDto(Commande commande) {
        List<AdminCommandeDto.LigneDto> lignes = commande.getLignes().stream()
                .map(l -> new AdminCommandeDto.LigneDto(l.getNomPlat(), l.getPrixUnitaire(), l.getQuantite()))
                .toList();
        return new AdminCommandeDto(
                commande.getId(),
                commande.getReference(),
                commande.getModeCommande().name(),
                commande.getStatut().name(),
                commande.getNomClient(),
                commande.getEmailClient(),
                commande.getTelephoneClient(),
                commande.getAdresseLivraison(),
                commande.getCommentaire(),
                commande.getModePaiement() != null ? commande.getModePaiement().name() : null,
                commande.getTotal(),
                commande.getCreatedAt(),
                lignes);
    }

    private List<CommandeResponseDto.LigneDto> mapLignesResponse(Commande commande) {
        List<CommandeResponseDto.LigneDto> out = new ArrayList<>();
        for (LigneCommande l : commande.getLignes()) {
            BigDecimal sousTotal = l.getPrixUnitaire().multiply(BigDecimal.valueOf(l.getQuantite()));
            out.add(new CommandeResponseDto.LigneDto(
                    l.getNomPlat(), l.getPrixUnitaire(), l.getQuantite(), sousTotal));
        }
        return out;
    }

    private List<PublicCommandeDetailDto.LigneDto> mapLignesPublic(Commande commande) {
        List<PublicCommandeDetailDto.LigneDto> out = new ArrayList<>();
        for (LigneCommande l : commande.getLignes()) {
            BigDecimal sousTotal = l.getPrixUnitaire().multiply(BigDecimal.valueOf(l.getQuantite()));
            out.add(new PublicCommandeDetailDto.LigneDto(
                    l.getNomPlat(), l.getPrixUnitaire(), l.getQuantite(), sousTotal));
        }
        return out;
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
