package com.andara.infrastructure.eventstore;

import com.andara.domain.DomainEvent;

import java.util.List;

/**
 * Interface for event store operations.
 */
public interface EventStore {
    void append(String aggregateId, String aggregateType, List<DomainEvent> events);
    List<DomainEvent> getEvents(String aggregateId, String aggregateType);
    boolean hasEvents(String aggregateId, String aggregateType);
}

