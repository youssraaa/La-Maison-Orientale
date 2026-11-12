package com.lamaisonorientale.commande.dto;

import java.util.List;

import com.lamaisonorientale.common.validation.ValidationMessages;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SubmitCommandeRequest(
        @NotNull String mode,
        @NotBlank @Size(max = 100) String nom,
        @NotBlank(message = ValidationMessages.EMAIL_REQUIRED)
                @Email(message = ValidationMessages.EMAIL_INVALID)
                @Size(max = 255, message = ValidationMessages.EMAIL_TOO_LONG)
                String email,
        @NotBlank(message = ValidationMessages.PHONE_REQUIRED)
                @Pattern(regexp = ValidationMessages.PHONE_PATTERN, message = ValidationMessages.PHONE_INVALID)
                @Size(max = 30, message = ValidationMessages.PHONE_TOO_LONG)
                String telephone,
        @Size(max = 500) String adresseLivraison,
        @Size(max = 200) String adresseLivraisonRue,
        @Size(max = 20) String adresseLivraisonNumero,
        @Size(max = 20) String codePostalLivraison,
        @Size(max = 100) String villeLivraison,
        @Size(max = 2000) String commentaire,
        String modePaiement,
        @NotEmpty @Valid List<LigneRequest> lignes) {

    public record LigneRequest(
            @NotNull Long platId,
            @NotNull @Min(1) Integer quantite) {}
}
