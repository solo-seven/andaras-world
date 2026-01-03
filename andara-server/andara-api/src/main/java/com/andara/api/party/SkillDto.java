package com.andara.api.party;

/**
 * DTO for skill information.
 */
public record SkillDto(
    String id,
    String name,
    String category,
    String description
) {
}

