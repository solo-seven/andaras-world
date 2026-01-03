package com.andara.api.party;

import com.andara.domain.party.Appearance;
import com.andara.domain.party.Origin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/**
 * DTO for character creation request.
 */
public record CreateCharacterRequestDto(
    @NotBlank(message = "Character name is required")
    @Size(min = 1, max = 50, message = "Character name must be between 1 and 50 characters")
    String name,

    @NotNull(message = "Origin is required")
    Origin origin,

    @NotNull(message = "Attributes are required")
    AttributesDto attributes,

    @NotNull(message = "Skill focuses are required")
    @Size(min = 2, max = 2, message = "Must specify exactly 2 focus skills")
    List<String> skillFocuses,

    @NotNull(message = "Appearance is required")
    AppearanceDto appearance,

    boolean isProtagonist,

    @NotNull(message = "Instance ID is required")
    UUID instanceId,

    @NotNull(message = "Agent ID is required")
    UUID agentId
) {
}

