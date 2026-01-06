package com.andara.infrastructure.repository;

import com.andara.domain.AggregateRoot;
import com.andara.domain.DomainEvent;

import java.util.List;

/**
 * Interface for event-sourced repositories.
 * 
 * @param <T> Aggregate root type
 * @param <ID> Aggregate identifier type
 */
public interface EventSourcedRepository<T extends AggregateRoot, ID> {
    /**
     * Load an aggregate by replaying its events.
     * 
     * @param id Aggregate identifier
     * @return Reconstituted aggregate
     * @throws com.andara.domain.AggregateNotFoundException if aggregate doesn't exist
     */
    T load(ID id);
    
    /**
     * Save an aggregate by persisting its uncommitted events.
     * 
     * @param aggregate Aggregate to save
     * @param events Uncommitted events to persist
     */
    void save(T aggregate, List<DomainEvent> events);
    
    /**
     * Check if an aggregate exists.
     * 
     * @param id Aggregate identifier
     * @return true if aggregate exists, false otherwise
     */
    boolean exists(ID id);
}
