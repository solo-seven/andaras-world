package com.andara.domain.party.events;

import com.andara.domain.DomainEvent;
import com.andara.domain.party.CharacterId;
import com.andara.domain.party.CharacterName;
import com.andara.domain.party.Origin;
import com.andara.domain.party.Attributes;
import com.andara.domain.party.Appearance;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Domain event emitted when a character is created.
 */
public record CharacterCreated(
    UUID eventId,
    String eventType,
    Instant timestamp,
    String aggregateId,
    String aggregateType,
    long version,
    Map<String, Object> payload,
    Map<String, String> metadata
) implements DomainEvent {

    public static CharacterCreated create(
        CharacterId characterId,
        CharacterName name,
        Origin origin,
        Attributes attributes,
        Map<String, Integer> startingSkills,
        Appearance appearance,
        boolean isProtagonist,
        UUID instanceId,
        UUID agentId
    ) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("characterId", characterId.toString());
        payload.put("name", name.getValue());
        payload.put("origin", origin.name());
        payload.put("strength", attributes.strength());
        payload.put("agility", attributes.agility());
        payload.put("endurance", attributes.endurance());
        payload.put("intellect", attributes.intellect());
        payload.put("perception", attributes.perception());
        payload.put("charisma", attributes.charisma());
        payload.put("startingSkills", startingSkills);
        payload.put("gender", appearance.getGender().name());
        payload.put("bodyType", appearance.getBodyType().name());
        payload.put("isProtagonist", isProtagonist);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("instanceId", instanceId.toString());
        metadata.put("agentId", agentId.toString());

        return new CharacterCreated(
            UUID.randomUUID(),
            "CharacterCreated",
            Instant.now(),
            characterId.toString(),
            "Character",
            1L,
            payload,
            metadata
        );
    }

    @Override
    public UUID getEventId() {
        return eventId;
    }

    @Override
    public String getEventType() {
        return eventType;
    }

    @Override
    public Instant getTimestamp() {
        return timestamp;
    }

    @Override
    public String getAggregateId() {
        return aggregateId;
    }

    @Override
    public String getAggregateType() {
        return aggregateType;
    }

    @Override
    public long getVersion() {
        return version;
    }

    @Override
    public Map<String, Object> getPayload() {
        return payload;
    }

    @Override
    public Map<String, String> getMetadata() {
        return metadata;
    }
}

