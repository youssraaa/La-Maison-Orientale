package com.lamaisonorientale.common.validation;

public final class ValidationMessages {

    public static final String EMAIL_EXAMPLE = "nom@email.com";
    public static final String PHONE_EXAMPLE = "0498 67 22 62";

    public static final String EMAIL_REQUIRED = "Veuillez indiquer votre adresse e-mail.";
    public static final String EMAIL_INVALID =
            "Format d'e-mail invalide. Exemple : " + EMAIL_EXAMPLE;
    public static final String EMAIL_TOO_LONG = "L'e-mail est trop long.";

    public static final String PHONE_REQUIRED = "Veuillez indiquer votre numéro de téléphone.";
    public static final String PHONE_INVALID =
            "Numéro invalide. Exemple : " + PHONE_EXAMPLE;
    public static final String PHONE_TOO_LONG =
            "Le numéro est trop long (10 chiffres max sans indicatif).";
    public static final String PHONE_TOO_SHORT = "Le numéro est trop court.";

    /** 0498 67 22 62, 498 67 22 62, +32 498 67 22 62, +32498672262 */
    public static final String PHONE_PATTERN =
            "^(\\+\\d{1,3}\\s?)?0?\\d[\\d\\s./-]{6,14}\\d$";

    private ValidationMessages() {}
}
