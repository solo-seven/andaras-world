package com.andara.domain.party;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AttributesTest {

    @Test
    void create_validAttributes_shouldSucceed() {
        Attributes attributes = Attributes.create(8, 8, 8, 8, 8, 8);
        assertEquals(48, attributes.total());
    }

    @Test
    void create_withPointDistribution_shouldSucceed() {
        // Point-buy system: start with 8 in each (48 total), distribute 27 points
        // Example: 13, 13, 13, 12, 12, 12 = 75 total (48 base + 27 distributed)
        Attributes attributes = Attributes.create(13, 13, 13, 12, 12, 12);
        assertEquals(75, attributes.total());
    }

    @Test
    void create_withReducedAttributes_shouldSucceed() {
        // Can reduce attributes below 8 to get points back
        // Example: 6, 6, 8, 8, 8, 8 = 44 total (48 base - 4 from reducing two attributes)
        Attributes attributes = Attributes.create(6, 6, 8, 8, 8, 8);
        assertEquals(44, attributes.total());
    }

    @Test
    void create_withMixedDistribution_shouldSucceed() {
        // Reduce some, increase others: 6, 6, 10, 10, 10, 10 = 52 total
        // Points: -2, -2, +2, +2, +2, +2 = +4 points used (within 27 limit)
        Attributes attributes = Attributes.create(6, 6, 10, 10, 10, 10);
        assertEquals(52, attributes.total());
    }

    @Test
    void create_exceedingPointLimit_shouldThrowException() {
        // Try to use more than 27 points: all 16s would use 48 points
        assertThrows(IllegalArgumentException.class, () -> {
            Attributes.create(16, 16, 16, 16, 16, 16);
        });
    }

    @Test
    void create_invalidRange_shouldThrowException() {
        assertThrows(IllegalArgumentException.class, () -> {
            Attributes.create(5, 8, 8, 8, 8, 8); // Below minimum
        });

        assertThrows(IllegalArgumentException.class, () -> {
            Attributes.create(17, 8, 8, 8, 8, 8); // Above maximum
        });
    }

    @Test
    void defaultAttributes_shouldCreateBaseAttributes() {
        Attributes attributes = Attributes.defaultAttributes();
        assertEquals(8, attributes.strength());
        assertEquals(8, attributes.agility());
        assertEquals(8, attributes.endurance());
        assertEquals(8, attributes.intellect());
        assertEquals(8, attributes.perception());
        assertEquals(8, attributes.charisma());
    }
}
