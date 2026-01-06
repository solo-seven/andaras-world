package com.andara.infrastructure.eventstore;

import com.andara.domain.AggregateId;
import com.andara.domain.AggregateType;
import com.andara.domain.DomainEvent;
import com.andara.domain.game.InstanceId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Interface for event store operations.
 * Provides methods for appending and retrieving domain events.
 */
public interface EventStore {
    /**
     * Append events to the event store.
     * Events must have aggregateId and aggregateType set.
     * 
     * @param events List of domain events to append
     * @throws com.andara.domain.ConcurrencyException if optimistic locking fails
     */
    void append(List<DomainEvent> events);
    
    /**
     * Get all events for an aggregate.
     * 
     * @param id Aggregate identifier
     * @param type Aggregate type
     * @return List of events in sequence order
     */
    List<DomainEvent> getEvents(AggregateId id, AggregateType type);
    
    /**
     * Get events for an aggregate starting from a specific sequence number.
     * Useful for loading aggregates from snapshots.
     * 
     * @param id Aggregate identifier
     * @param type Aggregate type
     * @param fromSequence Starting sequence number (exclusive)
     * @return List of events in sequence order
     */
    List<DomainEvent> getEvents(AggregateId id, AggregateType type, long fromSequence);
    
    /**
     * Get the latest event ID for an instance.
     * Used for sync tracking across instances.
     * 
     * @param instanceId Instance identifier
     * @return Optional UUID of the latest event, empty if no events exist
     */
    Optional<UUID> getLatestEventId(InstanceId instanceId);
    
    /**
     * Check if an aggregate has any events.
     * 
     * @param id Aggregate identifier
     * @param type Aggregate type
     * @return true if events exist, false otherwise
     */
    boolean hasEvents(AggregateId id, AggregateType type);
}

