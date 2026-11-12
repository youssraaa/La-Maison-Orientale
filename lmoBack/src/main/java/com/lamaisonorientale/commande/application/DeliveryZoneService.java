package com.lamaisonorientale.commande.application;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class DeliveryZoneService {

    private static final Set<String> ALLOWED_POSTAL_CODES = Set.of(
            "7000",
            "7011",
            "7012",
            "7020",
            "7021",
            "7022",
            "7024",
            "7030",
            "7031",
            "7032",
            "7033",
            "7034",
            "7040",
            "7041",
            "7340",
            "7370",
            "7380",
            "7390");

    private static final String ZONE_MESSAGE =
            "Livraison indisponible pour cette adresse. Zone desservie : Mons, Jemappes, Quaregnon et environs.";

    private static final Pattern POSTAL_CODE = Pattern.compile("\\b([1-9]\\d{3})\\b");

    public void assertDeliverable(String adresseLivraison) {
        if (!StringUtils.hasText(adresseLivraison)) {
            return;
        }
        String postalCode = extractPostalCode(adresseLivraison.trim());
        if (postalCode == null || !ALLOWED_POSTAL_CODES.contains(postalCode)) {
            throw new IllegalArgumentException(ZONE_MESSAGE);
        }
    }

    private String extractPostalCode(String address) {
        Matcher matcher = POSTAL_CODE.matcher(address);
        String first = null;
        while (matcher.find()) {
            String code = matcher.group(1);
            if (first == null) {
                first = code;
            }
            if (ALLOWED_POSTAL_CODES.contains(code)) {
                return code;
            }
        }
        return first;
    }
}
