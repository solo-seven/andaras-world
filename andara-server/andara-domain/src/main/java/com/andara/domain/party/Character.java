package com.andara.domain.party;

import com.andara.domain.AggregateRoot;
import com.andara.domain.DomainEvent;
import com.andara.domain.party.events.CharacterCreated;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Character aggregate root.
 * Represents a character in the game world.
 */
public class Character extends AggregateRoot {
    private CharacterId characterId;
    private CharacterName name;
    private Origin origin;
    private Attributes attributes;
    private Map<SkillId, Proficiency> skills;
    private Appearance appearance;
    private boolean isProtagonist;

    private Character() {
        this.skills = new HashMap<>();
    }

    /**
     * Create a new character.
     */
    public static Character create(
        CharacterId characterId,
        CharacterName name,
        Origin origin,
        Attributes attributes,
        List<SkillId> skillFocuses,
        Appearance appearance,
        boolean isProtagonist,
        UUID instanceId,
        UUID agentId
    ) {
        Character character = new Character();
        character.characterId = characterId;
        character.id = characterId.toString();
        character.name = name;
        character.origin = origin;
        character.attributes = attributes;
        character.appearance = appearance;
        character.isProtagonist = isProtagonist;

        // Initialize skills: focus skills at 20, others at 0
        for (SkillId skillId : skillFocuses) {
            character.skills.put(skillId, Proficiency.of(20));
        }

        // Apply origin bonuses
        character.applyOriginBonuses();

        // Create and apply event
        Map<String, Integer> startingSkills = new HashMap<>();
        character.skills.forEach((skillId, proficiency) -> {
            startingSkills.put(skillId.getValue(), proficiency.getLevel());
        });

        CharacterCreated event = CharacterCreated.create(
            characterId,
            name,
            origin,
            attributes,
            startingSkills,
            appearance,
            isProtagonist,
            instanceId,
            agentId
        );

        character.applyEvent(event);
        return character;
    }

    /**
     * Reconstitute character from events.
     */
    public static Character fromEvents(List<DomainEvent> events) {
        Character character = new Character();
        for (DomainEvent event : events) {
            character.when(event);
        }
        return character;
    }

    private void applyOriginBonuses() {
        // Apply origin-specific skill bonuses
        // Origin gives one skill at 15 (if not already a focus skill)
        // Focus skills are already at 20, so we don't override them
        switch (origin) {
            case VAULT_DWELLER:
                // Tech skills bonus - only if not already a focus skill
                addSkillProficiencyIfNotPresent(SkillId.of("mechanics"), 15);
                addSkillProficiencyIfNotPresent(SkillId.of("electronics"), 15);
                break;
            case WASTELANDER:
                // Survival skills bonus
                addSkillProficiencyIfNotPresent(SkillId.of("scavenging"), 15);
                addSkillProficiencyIfNotPresent(SkillId.of("tracking"), 15);
                break;
            case RIFT_TOUCHED:
                // Arcane skills bonus
                addSkillProficiencyIfNotPresent(SkillId.of("rift_manipulation"), 15);
                addSkillProficiencyIfNotPresent(SkillId.of("perception"), 15);
                break;
        }
    }

    private void addSkillProficiencyIfNotPresent(SkillId skillId, int level) {
        // Only add if skill doesn't already exist (focus skills are set first)
        if (!skills.containsKey(skillId)) {
            skills.put(skillId, Proficiency.of(level));
        }
    }

    @Override
    protected void when(DomainEvent event) {
        if (event instanceof CharacterCreated e) {
            handleCharacterCreated(e);
        }
    }

    private void handleCharacterCreated(CharacterCreated event) {
        this.characterId = CharacterId.from(event.getAggregateId());
        this.id = characterId.toString();
        this.name = CharacterName.of((String) event.getPayload().get("name"));
        this.origin = Origin.valueOf((String) event.getPayload().get("origin"));
        this.attributes = Attributes.create(
            (Integer) event.getPayload().get("strength"),
            (Integer) event.getPayload().get("agility"),
            (Integer) event.getPayload().get("endurance"),
            (Integer) event.getPayload().get("intellect"),
            (Integer) event.getPayload().get("perception"),
            (Integer) event.getPayload().get("charisma")
        );
        this.appearance = Appearance.create(
            Appearance.Gender.valueOf((String) event.getPayload().get("gender")),
            Appearance.BodyType.valueOf((String) event.getPayload().get("bodyType"))
        );
        this.isProtagonist = (Boolean) event.getPayload().get("isProtagonist");

        // Restore skills
        @SuppressWarnings("unchecked")
        Map<String, Integer> startingSkills = (Map<String, Integer>) event.getPayload().get("startingSkills");
        if (startingSkills != null) {
            startingSkills.forEach((skillIdStr, level) -> {
                skills.put(SkillId.of(skillIdStr), Proficiency.of(level));
            });
        }
    }


    // Getters
    public CharacterId getCharacterId() {
        return characterId;
    }

    public CharacterName getName() {
        return name;
    }

    public Origin getOrigin() {
        return origin;
    }

    public Attributes getAttributes() {
        return attributes;
    }

    public Map<SkillId, Proficiency> getSkills() {
        return Map.copyOf(skills);
    }

    public Appearance getAppearance() {
        return appearance;
    }

    public boolean isProtagonist() {
        return isProtagonist;
    }
}

