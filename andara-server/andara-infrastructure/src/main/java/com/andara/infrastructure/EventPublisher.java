package com.andara.infrastructure;

import com.andara.domain.DomainEvent;

import java.util.List;

/**
 * Interface for publishing domain events.
 */
public interface EventPublisher {
    void publish(List<DomainEvent> events);
}

