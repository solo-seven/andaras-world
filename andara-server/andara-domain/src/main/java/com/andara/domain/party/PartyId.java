package com.andara.domain.party;

import java.util.UUID;

/**
 * Value object representing a party identifier.
 */
public record PartyId(UUID value) {
    public static PartyId generate() {
        return new PartyId(UUID.randomUUID());
    }

    public static PartyId from(UUID uuid) {
        return new PartyId(uuid);
    }

    public static PartyId from(String uuidString) {
        return new PartyId(UUID.fromString(uuidString));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
