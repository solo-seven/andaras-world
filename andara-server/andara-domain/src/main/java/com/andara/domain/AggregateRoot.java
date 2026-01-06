package com.andara.domain;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/**
 * Base class for all aggregate roots in the domain model.
 * Aggregates are the consistency boundaries in DDD.
 * 
 * Supports event sourcing with:
 * - Event application for new events (tracked as uncommitted)
 * - Historical event application for event replay (not tracked)
 * - Snapshot support for performance optimization
 */
public abstract class AggregateRoot {
    protected String id;
    protected long version;
    protected List<DomainEvent> uncommittedEvents = new ArrayList<>();

    /**
     * Apply a new domain event.
     * Updates state, increments version, and tracks as uncommitted.
     * 
     * For new events, the version is always incremented regardless of the event's
     * version field. The event's version field is only meaningful for historical
     * events being replayed via applyHistoricalEvent().
     * 
     * @param event Domain event to apply
     */
    protected void applyEvent(DomainEvent event) {
        when(event);
        // Always increment version for new events
        // The event's version field is synthetic and not used for new events
        version++;
        uncommittedEvents.add(event);
    }

    /**
     * Apply a historical event (from event store).
     * Updates state and sets version, but does NOT track as uncommitted.
     * Used when replaying events to reconstitute aggregate state.
     * 
     * @param event Historical domain event to apply
     */
    public void applyHistoricalEvent(DomainEvent event) {
        when(event);
        // Set version from event (don't increment)
        version = event.getVersion();
        // Do NOT add to uncommitted events
    }

    /**
     * Handle domain events to update aggregate state.
     * Must be implemented by subclasses.
     * 
     * @param event Domain event to handle
     */
    protected abstract void when(DomainEvent event);

    /**
     * Convert aggregate state to a snapshot for persistence.
     * Must be implemented by subclasses that support snapshots.
     * 
     * @return JSON representation of aggregate state
     */
    public abstract JsonNode toSnapshot();

    /**
     * Restore aggregate state from a snapshot.
     * Must be implemented by subclasses that support snapshots.
     * 
     * @param snapshot JSON representation of aggregate state
     */
    public abstract void fromSnapshot(JsonNode snapshot);

    public List<DomainEvent> getUncommittedEvents() {
        return List.copyOf(uncommittedEvents);
    }

    public void markCommitted() {
        uncommittedEvents.clear();
    }

    public String getId() {
        return id;
    }

    public long getVersion() {
        return version;
    }
}


