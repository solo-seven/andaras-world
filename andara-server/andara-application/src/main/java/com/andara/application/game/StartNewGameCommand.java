package com.andara.application.game;

import com.andara.domain.party.Origin;
import com.andara.domain.party.Attributes;
import com.andara.domain.party.Appearance;

import java.util.List;
import java.util.UUID;

/**
 * Command to start a new game instance with character creation.
 */
public record StartNewGameCommand(
    String name,
    Origin origin,
    Attributes attributes,
    List<String> skillFocuses, // Skill IDs as strings
    Appearance appearance,
    UUID agentId
) {
    public StartNewGameCommand {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Character name cannot be null or blank");
        }
        if (name.length() < 2 || name.length() > 30) {
            throw new IllegalArgumentException("Character name must be between 2 and 30 characters");
        }
        if (origin == null) {
            throw new IllegalArgumentException("Origin cannot be null");
        }
        if (attributes == null) {
            throw new IllegalArgumentException("Attributes cannot be null");
        }
        if (skillFocuses == null || skillFocuses.size() != 2) {
            throw new IllegalArgumentException("Must specify exactly 2 focus skills");
        }
        if (appearance == null) {
            throw new IllegalArgumentException("Appearance cannot be null");
        }
        if (agentId == null) {
            throw new IllegalArgumentException("Agent ID cannot be null");
        }
    }
}
