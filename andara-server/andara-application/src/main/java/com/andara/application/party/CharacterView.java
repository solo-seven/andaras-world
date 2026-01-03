package com.andara.application.party;

import com.andara.domain.party.*;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Read model DTO for character display.
 */
public record CharacterView(
    String characterId,
    String name,
    String origin,
    Attributes attributes,
    Map<String, Integer> skills,
    Appearance appearance,
    boolean isProtagonist
) {
    public static CharacterView from(com.andara.domain.party.Character character) {
        Map<String, Integer> skillsMap = character.getSkills().entrySet().stream()
            .collect(Collectors.toMap(
                entry -> entry.getKey().getValue(),
                entry -> entry.getValue().getLevel()
            ));

        return new CharacterView(
            character.getCharacterId().toString(),
            character.getName().getValue(),
            character.getOrigin().name(),
            character.getAttributes(),
            skillsMap,
            character.getAppearance(),
            character.isProtagonist()
        );
    }
}

