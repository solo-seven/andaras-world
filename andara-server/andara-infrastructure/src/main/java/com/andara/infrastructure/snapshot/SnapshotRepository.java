package com.andara.infrastructure.snapshot;

import com.andara.domain.AggregateId;
import com.andara.domain.AggregateType;
import com.andara.domain.AggregateRoot;

import java.util.Optional;

/**
 * Repository for managing aggregate snapshots.
 * Snapshots are used to optimize aggregate loading by avoiding full event replay.
 */
public interface SnapshotRepository {
    /**
     * Save a snapshot of an aggregate.
     * 
     * @param aggregate Aggregate to snapshot
     */
    void saveSnapshot(AggregateRoot aggregate);
    
    /**
     * Find the latest snapshot for an aggregate.
     * 
     * @param aggregateId Aggregate identifier
     * @param aggregateType Aggregate type
     * @return Optional snapshot, empty if none exists
     */
    Optional<Snapshot> findLatest(AggregateId aggregateId, AggregateType aggregateType);
}
