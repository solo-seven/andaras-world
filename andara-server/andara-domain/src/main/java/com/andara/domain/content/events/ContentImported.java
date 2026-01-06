package com.andara.domain.content.events;

import com.andara.domain.DomainEvent;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Domain event emitted when content is imported.
 */
public record ContentImported(
    UUID eventId,
    String eventType,
    Instant timestamp,
    String aggregateId,
    String aggregateType,
    long version,
    Map<String, Object> payload,
    Map<String, String> metadata
) implements DomainEvent {

    public static ContentImported create(
        String contentType,
        List<String> importedIds,
        String importedBy,
        UUID instanceId,
        UUID agentId
    ) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("contentType", contentType);
        payload.put("importedIds", importedIds);
        payload.put("importedBy", importedBy);
        payload.put("count", importedIds.size());

        Map<String, String> metadata = new HashMap<>();
        metadata.put("instanceId", instanceId != null ? instanceId.toString() : "system");
        metadata.put("agentId", agentId != null ? agentId.toString() : "system");

        return new ContentImported(
            UUID.randomUUID(),
            "ContentImported",
            Instant.now(),
            contentType,
            "Content",
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
