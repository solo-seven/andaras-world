package com.andara.domain;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Base interface for all domain events.
 * Events are immutable facts about something that happened.
 */
public interface DomainEvent {
    UUID getEventId();
    String getEventType();
    Instant getTimestamp();
    String getAggregateId();
    String getAggregateType();
    long getVersion();
    Map<String, Object> getPayload();
    Map<String, String> getMetadata();
}


