package com.lamaisonorientale.commande.application;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class DeliveryZoneServiceTest {

    private final DeliveryZoneService deliveryZoneService = new DeliveryZoneService();

    @Test
    void assertDeliverable_WithAllowedPostalCode_ShouldPass() {
        assertThatCode(() -> deliveryZoneService.assertDeliverable("Rue de la Gare 12, 7000 Mons"))
                .doesNotThrowAnyException();
    }

    @Test
    void assertDeliverable_WithDisallowedPostalCode_ShouldThrow() {
        assertThatThrownBy(() -> deliveryZoneService.assertDeliverable("Grand Place 1, 1000 Bruxelles"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Livraison indisponible");
    }

    @Test
    void assertDeliverable_WithBlankAddress_ShouldPass() {
        assertThatCode(() -> deliveryZoneService.assertDeliverable("   "))
                .doesNotThrowAnyException();
    }
}
