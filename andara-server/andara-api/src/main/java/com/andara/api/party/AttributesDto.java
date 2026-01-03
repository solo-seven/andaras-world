package com.andara.api.party;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for character attributes.
 */
public record AttributesDto(
    @NotNull(message = "Strength is required")
    @Min(value = 6, message = "Strength must be at least 6")
    @Max(value = 16, message = "Strength must be at most 16")
    Integer strength,

    @NotNull(message = "Agility is required")
    @Min(value = 6, message = "Agility must be at least 6")
    @Max(value = 16, message = "Agility must be at most 16")
    Integer agility,

    @NotNull(message = "Endurance is required")
    @Min(value = 6, message = "Endurance must be at least 6")
    @Max(value = 16, message = "Endurance must be at most 16")
    Integer endurance,

    @NotNull(message = "Intellect is required")
    @Min(value = 6, message = "Intellect must be at least 6")
    @Max(value = 16, message = "Intellect must be at most 16")
    Integer intellect,

    @NotNull(message = "Perception is required")
    @Min(value = 6, message = "Perception must be at least 6")
    @Max(value = 16, message = "Perception must be at most 16")
    Integer perception,

    @NotNull(message = "Charisma is required")
    @Min(value = 6, message = "Charisma must be at least 6")
    @Max(value = 16, message = "Charisma must be at most 16")
    Integer charisma
) {
}

