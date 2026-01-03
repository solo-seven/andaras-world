package com.andara.application.party;

import com.andara.domain.party.Origin;

/**
 * DTO containing origin metadata for UI display.
 */
public record OriginDefinition(
    String id,
    String displayName,
    String description
) {
    public static OriginDefinition from(Origin origin) {
        return new OriginDefinition(
            origin.name(),
            origin.getDisplayName(),
            origin.getDescription()
        );
    }
}

