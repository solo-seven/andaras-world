package com.andara.infrastructure;

import com.andara.domain.DomainEvent;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Interface for publishing domain events.
 */
public interface EventPublisher {
    /**
     * Publish events synchronously.
     * 
     * @param events List of domain events to publish
     * @return CompletableFuture that completes when all events are published
     */
    CompletableFuture<Void> publish(List<DomainEvent> events);
    
    /**
     * Publish events asynchronously (alias for publish).
     * 
     * @param events List of domain events to publish
     * @return CompletableFuture that completes when all events are published
     */
    default CompletableFuture<Void> publishAsync(List<DomainEvent> events) {
        return publish(events);
    }
}

