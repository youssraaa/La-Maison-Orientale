package com.lamaisonorientale.demande.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReplyMessageRequest(
        @NotBlank @Size(max = 4000) String reponse) {}
