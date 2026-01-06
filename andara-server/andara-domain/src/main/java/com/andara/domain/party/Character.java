package com.andara.domain.party;

import com.andara.domain.AggregateRoot;
import com.andara.domain.DomainEvent;
import com.andara.domain.party.events.CharacterCreated;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

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
        UUID partyId,
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
            partyId,
            agentId
        );

        character.applyEvent(event);
        return character;
    }

    /**
     * Create an empty character for event replay.
     */
    public static Character empty(CharacterId characterId) {
        Character character = new Character();
        character.characterId = characterId;
        character.id = characterId.toString();
        return character;
    }

    /**
     * Reconstitute character from events.
     */
    public static Character fromEvents(List<DomainEvent> events) {
        if (events.isEmpty()) {
            throw new IllegalArgumentException("Cannot create character from empty event list");
        }
        
        // Extract character ID from first event
        String characterIdStr = events.get(0).getAggregateId();
        CharacterId characterId = CharacterId.from(characterIdStr);
        Character character = empty(characterId);
        
        // Apply all events as historical events
        for (DomainEvent event : events) {
            character.applyHistoricalEvent(event);
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

    @Override
    public JsonNode toSnapshot() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode snapshot = mapper.createObjectNode();
        snapshot.put("characterId", characterId != null ? characterId.toString() : null);
        snapshot.put("name", name != null ? name.getValue() : null);
        snapshot.put("origin", origin != null ? origin.name() : null);
        snapshot.put("isProtagonist", isProtagonist);
        snapshot.put("version", version);
        
        // Serialize attributes
        if (attributes != null) {
            ObjectNode attrsNode = mapper.createObjectNode();
            attrsNode.put("strength", attributes.strength());
            attrsNode.put("agility", attributes.agility());
            attrsNode.put("endurance", attributes.endurance());
            attrsNode.put("intellect", attributes.intellect());
            attrsNode.put("perception", attributes.perception());
            attrsNode.put("charisma", attributes.charisma());
            snapshot.set("attributes", attrsNode);
        }
        
        // Serialize appearance
        if (appearance != null) {
            ObjectNode appearanceNode = mapper.createObjectNode();
            appearanceNode.put("gender", appearance.getGender().name());
            appearanceNode.put("bodyType", appearance.getBodyType().name());
            snapshot.set("appearance", appearanceNode);
        }
        
        // Serialize skills
        ObjectNode skillsNode = mapper.createObjectNode();
        if (skills != null) {
            skills.forEach((skillId, proficiency) -> {
                ObjectNode profNode = mapper.createObjectNode();
                profNode.put("level", proficiency.getLevel());
                skillsNode.set(skillId.getValue(), profNode);
            });
        }
        snapshot.set("skills", skillsNode);
        
        return snapshot;
    }

    @Override
    public void fromSnapshot(JsonNode snapshot) {
        if (snapshot.has("characterId") && !snapshot.get("characterId").isNull()) {
            this.characterId = CharacterId.from(snapshot.get("characterId").asText());
            this.id = characterId.toString();
        }
        if (snapshot.has("name") && !snapshot.get("name").isNull()) {
            this.name = CharacterName.of(snapshot.get("name").asText());
        }
        if (snapshot.has("origin") && !snapshot.get("origin").isNull()) {
            this.origin = Origin.valueOf(snapshot.get("origin").asText());
        }
        if (snapshot.has("isProtagonist")) {
            this.isProtagonist = snapshot.get("isProtagonist").asBoolean();
        }
        if (snapshot.has("version")) {
            this.version = snapshot.get("version").asLong();
        }
        
        // Restore attributes
        if (snapshot.has("attributes") && !snapshot.get("attributes").isNull()) {
            JsonNode attrsNode = snapshot.get("attributes");
            this.attributes = Attributes.create(
                attrsNode.get("strength").asInt(),
                attrsNode.get("agility").asInt(),
                attrsNode.get("endurance").asInt(),
                attrsNode.get("intellect").asInt(),
                attrsNode.get("perception").asInt(),
                attrsNode.get("charisma").asInt()
            );
        }
        
        // Restore appearance
        if (snapshot.has("appearance") && !snapshot.get("appearance").isNull()) {
            JsonNode appearanceNode = snapshot.get("appearance");
            this.appearance = Appearance.create(
                Appearance.Gender.valueOf(appearanceNode.get("gender").asText()),
                Appearance.BodyType.valueOf(appearanceNode.get("bodyType").asText())
            );
        }
        
        // Restore skills
        if (snapshot.has("skills") && !snapshot.get("skills").isNull()) {
            JsonNode skillsNode = snapshot.get("skills");
            this.skills = new HashMap<>();
            skillsNode.fields().forEachRemaining(entry -> {
                JsonNode profNode = entry.getValue();
                Proficiency proficiency = Proficiency.of(profNode.get("level").asInt());
                this.skills.put(SkillId.of(entry.getKey()), proficiency);
            });
        }
    }
}

