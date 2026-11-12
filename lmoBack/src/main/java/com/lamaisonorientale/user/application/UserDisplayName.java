package com.lamaisonorientale.user.application;

import com.lamaisonorientale.user.domain.Utilisateur;

public final class UserDisplayName {

    private UserDisplayName() {}

    public static String of(String prenom, String nom) {
        String first = prenom != null ? prenom.trim() : "";
        String last = nom != null ? nom.trim() : "";
        if (!first.isEmpty() && !last.isEmpty()) {
            return first + " " + last;
        }
        if (!last.isEmpty()) {
            return last;
        }
        if (!first.isEmpty()) {
            return first;
        }
        return "";
    }

    public static String of(Utilisateur user) {
        return of(user.getPrenom(), user.getNom());
    }
}
