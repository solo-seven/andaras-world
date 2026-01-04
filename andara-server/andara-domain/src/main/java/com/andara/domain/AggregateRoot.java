package com.andara.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * Base class for all aggregate roots in the domain model.
 * Aggregates are the consistency boundaries in DDD.
 */
public abstract class AggregateRoot {
    protected String id;
    protected long version;
    protected List<DomainEvent> uncommittedEvents = new ArrayList<>();

    protected void applyEvent(DomainEvent event) {
        when(event);
        version++;
        uncommittedEvents.add(event);
    }

    /**
     * Handle domain events to update aggregate state.
     * Must be implemented by subclasses.
     */
    protected abstract void when(DomainEvent event);

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


