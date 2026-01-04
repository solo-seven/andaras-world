package com.andara.domain.party.events;

import com.andara.domain.DomainEvent;
import com.andara.domain.game.InstanceId;
import com.andara.domain.party.CharacterId;
import com.andara.domain.party.PartyId;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Domain event emitted when a party is created.
 */
public record PartyCreated(
    UUID eventId,
    String eventType,
    Instant timestamp,
    String aggregateId,
    String aggregateType,
    long version,
    Map<String, Object> payload,
    Map<String, String> metadata
) implements DomainEvent {

    public static PartyCreated create(
        PartyId partyId,
        InstanceId instanceId,
        CharacterId protagonistId,
        UUID agentId
    ) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("partyId", partyId.toString());
        payload.put("instanceId", instanceId.toString());
        payload.put("protagonistId", protagonistId.toString());

        Map<String, String> metadata = new HashMap<>();
        metadata.put("instanceId", instanceId.toString());
        metadata.put("agentId", agentId.toString());

        return new PartyCreated(
            UUID.randomUUID(),
            "PartyCreated",
            Instant.now(),
            partyId.toString(),
            "Party",
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
