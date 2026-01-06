package com.andara.infrastructure.snapshot;

import com.andara.domain.AggregateId;
import com.andara.domain.AggregateType;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;

/**
 * Value object representing an aggregate snapshot.
 * Snapshots capture aggregate state at a specific sequence number for performance optimization.
 */
public record Snapshot(
    AggregateId aggregateId,
    AggregateType aggregateType,
    long sequenceNumber,
    JsonNode snapshotData,
    Instant createdAt
) {
}
