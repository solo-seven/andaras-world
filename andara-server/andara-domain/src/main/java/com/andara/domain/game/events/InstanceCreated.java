package com.andara.domain.game.events;

import com.andara.domain.DomainEvent;
import com.andara.domain.game.InstanceId;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Domain event emitted when a new game instance is created.
 */
public record InstanceCreated(
    UUID eventId,
    String eventType,
    Instant timestamp,
    String aggregateId,
    String aggregateType,
    long version,
    Map<String, Object> payload,
    Map<String, String> metadata
) implements DomainEvent {

    public static InstanceCreated create(
        InstanceId instanceId,
        UUID ownerAgentId,
        UUID systemAgentId
    ) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("instanceId", instanceId.toString());
        payload.put("ownerAgentId", ownerAgentId.toString());

        Map<String, String> metadata = new HashMap<>();
        metadata.put("instanceId", instanceId.toString());
        metadata.put("agentId", ownerAgentId.toString());
        metadata.put("createdBy", systemAgentId.toString());

        return new InstanceCreated(
            UUID.randomUUID(),
            "InstanceCreated",
            Instant.now(),
            instanceId.toString(),
            "Instance",
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
