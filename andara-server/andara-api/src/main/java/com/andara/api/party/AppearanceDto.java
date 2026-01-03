package com.andara.api.party;

import com.andara.domain.party.Appearance;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for character appearance.
 */
public record AppearanceDto(
    @NotNull(message = "Gender is required")
    Appearance.Gender gender,

    @NotNull(message = "Body type is required")
    Appearance.BodyType bodyType
) {
    public com.andara.domain.party.Appearance toDomain() {
        return com.andara.domain.party.Appearance.create(gender, bodyType);
    }
}

