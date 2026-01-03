package com.andara.api.party;

import com.andara.domain.party.Attributes;
import com.andara.domain.party.Appearance;

import java.util.Map;

/**
 * DTO for character response.
 */
public record CharacterResponseDto(
    String characterId,
    String name,
    String origin,
    com.andara.domain.party.Attributes attributes,
    Map<String, Integer> skills,
    com.andara.domain.party.Appearance appearance,
    boolean isProtagonist
) {
}

