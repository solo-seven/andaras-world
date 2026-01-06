package com.andara.infrastructure.kafka;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Envelope wrapping domain events for Kafka publishing.
 * Provides consistent structure for all event messages.
 */
public record EventEnvelope(
    @JsonProperty("eventId") UUID eventId,
    @JsonProperty("eventType") String eventType,
    @JsonProperty("timestamp") Instant timestamp,
    @JsonProperty("aggregateId") String aggregateId,
    @JsonProperty("aggregateType") String aggregateType,
    @JsonProperty("version") long version,
    @JsonProperty("payload") Map<String, Object> payload,
    @JsonProperty("metadata") Map<String, String> metadata
) {
    /**
     * Create an EventEnvelope from a DomainEvent.
     */
    public static EventEnvelope from(com.andara.domain.DomainEvent event) {
        return new EventEnvelope(
            event.getEventId(),
            event.getEventType(),
            event.getTimestamp(),
            event.getAggregateId(),
            event.getAggregateType(),
            event.getVersion(),
            event.getPayload(),
            event.getMetadata()
        );
    }
}
