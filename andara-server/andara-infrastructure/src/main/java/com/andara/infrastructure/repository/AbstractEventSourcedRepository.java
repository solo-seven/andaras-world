package com.andara.infrastructure.repository;

import com.andara.domain.AggregateId;
import com.andara.domain.AggregateNotFoundException;
import com.andara.domain.AggregateRoot;
import com.andara.domain.AggregateType;
import com.andara.domain.DomainEvent;
import com.andara.infrastructure.EventPublisher;
import com.andara.infrastructure.eventstore.EventStore;
import com.andara.infrastructure.snapshot.Snapshot;
import com.andara.infrastructure.snapshot.SnapshotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Abstract base class for event-sourced repositories.
 * Provides common functionality for loading aggregates from events and saving new events.
 * Supports snapshot-based loading for performance optimization.
 * 
 * @param <T> Aggregate root type
 * @param <ID> Aggregate identifier type
 */
public abstract class AbstractEventSourcedRepository<T extends AggregateRoot, ID> 
    implements EventSourcedRepository<T, ID> {
    
    private static final Logger log = LoggerFactory.getLogger(AbstractEventSourcedRepository.class);
    private static final int DEFAULT_SNAPSHOT_THRESHOLD = 100;
    
    protected final EventStore eventStore;
    protected final EventPublisher eventPublisher;
    protected final SnapshotRepository snapshotRepository;
    protected final int snapshotThreshold;
    
    public AbstractEventSourcedRepository(
        EventStore eventStore, 
        EventPublisher eventPublisher,
        SnapshotRepository snapshotRepository,
        @Value("${eventstore.snapshot.threshold:" + DEFAULT_SNAPSHOT_THRESHOLD + "}") int snapshotThreshold
    ) {
        this.eventStore = eventStore;
        this.eventPublisher = eventPublisher;
        this.snapshotRepository = snapshotRepository;
        this.snapshotThreshold = snapshotThreshold;
    }
    
    @Override
    @Transactional
    public void save(T aggregate, List<DomainEvent> events) {
        if (events.isEmpty()) {
            return;
        }
        
        // Persist events to event store
        try {
            eventStore.append(events);
        } catch (Exception e) {
            log.error("Failed to persist events for aggregate {}", aggregate.getId(), e);
            throw new RuntimeException("Failed to persist events", e);
        }
        
        // Publish events to Kafka
        try {
            var future = eventPublisher.publish(events);
            if (future != null) {
                future
                    .exceptionally(ex -> {
                        log.error("Failed to publish events for aggregate {}", aggregate.getId(), ex);
                        // Don't throw here - events are already persisted
                        // Return null to complete the future chain successfully
                        // In future, consider transactional outbox pattern for guaranteed delivery
                        return null; // CompletableFuture<Void> completes with null
                    })
                    .join(); // Wait for completion in transactional context
            }
        } catch (Exception e) {
            log.error("Event publishing failed for aggregate {}", aggregate.getId(), e);
            // Events are persisted, but publishing failed
            // This is acceptable for now - events can be replayed later
        }
        
        aggregate.markCommitted();
        
        // Check if snapshot should be created
        if (shouldCreateSnapshot(aggregate)) {
            try {
                snapshotRepository.saveSnapshot(aggregate);
                log.debug("Created snapshot for aggregate {} at version {}", 
                    aggregate.getId(), aggregate.getVersion());
            } catch (Exception e) {
                log.warn("Failed to create snapshot for aggregate {}", aggregate.getId(), e);
                // Don't fail the save operation if snapshot creation fails
            }
        }
    }
    
    /**
     * Determine if a snapshot should be created for an aggregate.
     * Creates snapshots periodically based on the configured threshold.
     * 
     * @param aggregate Aggregate to check
     * @return true if snapshot should be created
     */
    private boolean shouldCreateSnapshot(T aggregate) {
        return aggregate.getVersion() > 0 && aggregate.getVersion() % snapshotThreshold == 0;
    }
    
    @Override
    public T load(ID id) {
        AggregateId aggregateId = toAggregateId(id);
        AggregateType aggregateType = getAggregateType();
        
        // Try to load from snapshot first
        Optional<Snapshot> snapshot = snapshotRepository.findLatest(aggregateId, aggregateType);
        
        long fromSequence = snapshot.map(Snapshot::sequenceNumber).orElse(0L);
        
        // Load events since snapshot (or all events if no snapshot)
        List<DomainEvent> events = eventStore.getEvents(aggregateId, aggregateType, fromSequence);
        
        if (snapshot.isEmpty() && events.isEmpty()) {
            throw new AggregateNotFoundException(aggregateId, aggregateType);
        }
        
        // Create empty aggregate
        T aggregate = createEmpty(id);
        
        // Restore from snapshot if available
        if (snapshot.isPresent()) {
            aggregate.fromSnapshot(snapshot.get().snapshotData());
            log.debug("Loaded aggregate {} from snapshot at sequence {}", aggregateId, fromSequence);
        }
        
        // Apply remaining events since snapshot
        for (DomainEvent event : events) {
            aggregate.applyHistoricalEvent(event);
        }
        
        if (snapshot.isPresent() && !events.isEmpty()) {
            log.debug("Replayed {} events since snapshot for aggregate {}", events.size(), aggregateId);
        }
        
        return aggregate;
    }
    
    @Override
    public boolean exists(ID id) {
        AggregateId aggregateId = toAggregateId(id);
        AggregateType aggregateType = getAggregateType();
        return eventStore.hasEvents(aggregateId, aggregateType);
    }
    
    /**
     * Convert aggregate identifier to AggregateId value object.
     * 
     * @param id Aggregate identifier
     * @return AggregateId value object
     */
    protected abstract AggregateId toAggregateId(ID id);
    
    /**
     * Get the aggregate type for this repository.
     * 
     * @return Aggregate type
     */
    protected abstract AggregateType getAggregateType();
    
    /**
     * Create an empty aggregate instance for event replay.
     * 
     * @param id Aggregate identifier
     * @return Empty aggregate instance
     */
    protected abstract T createEmpty(ID id);
}
