package com.andara.infrastructure.snapshot;

import com.andara.domain.AggregateId;
import com.andara.domain.AggregateType;
import com.andara.domain.AggregateRoot;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

/**
 * JDBC implementation of snapshot repository.
 */
@Repository
public class JdbcSnapshotRepository implements SnapshotRepository {
    
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    
    public JdbcSnapshotRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }
    
    @Override
    @Transactional
    public void saveSnapshot(AggregateRoot aggregate) {
        AggregateId aggregateId = AggregateId.of(aggregate.getId());
        AggregateType aggregateType = getAggregateType(aggregate);
        long sequenceNumber = aggregate.getVersion();
        JsonNode snapshotData = aggregate.toSnapshot();
        Instant createdAt = Instant.now();
        
        try {
            String snapshotJson = objectMapper.writeValueAsString(snapshotData);
            
            // Use INSERT ... ON CONFLICT to update existing snapshot
            jdbcTemplate.update(
                """
                INSERT INTO aggregate_snapshots (
                    aggregate_id, aggregate_type, sequence_number, 
                    snapshot_data, created_at
                ) VALUES (?, ?, ?, ?::jsonb, ?)
                ON CONFLICT (aggregate_id, aggregate_type) 
                DO UPDATE SET 
                    sequence_number = EXCLUDED.sequence_number,
                    snapshot_data = EXCLUDED.snapshot_data,
                    created_at = EXCLUDED.created_at
                """,
                aggregateId.getValue(),
                aggregateType.getValue(),
                sequenceNumber,
                snapshotJson,
                Timestamp.from(createdAt)
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to save snapshot", e);
        }
    }
    
    @Override
    public Optional<Snapshot> findLatest(AggregateId aggregateId, AggregateType aggregateType) {
        try {
            Snapshot snapshot = jdbcTemplate.queryForObject(
                """
                SELECT aggregate_id, aggregate_type, sequence_number, 
                       snapshot_data, created_at
                FROM aggregate_snapshots
                WHERE aggregate_id = ? AND aggregate_type = ?
                """,
                this::mapRowToSnapshot,
                aggregateId.getValue(),
                aggregateType.getValue()
            );
            return Optional.ofNullable(snapshot);
        } catch (EmptyResultDataAccessException e) {
            // No snapshot found for this aggregate
            return Optional.empty();
        }
    }
    
    private Snapshot mapRowToSnapshot(ResultSet rs, int rowNum) throws SQLException {
        try {
            AggregateId aggregateId = AggregateId.of(rs.getString("aggregate_id"));
            AggregateType aggregateType = AggregateType.of(rs.getString("aggregate_type"));
            long sequenceNumber = rs.getLong("sequence_number");
            Instant createdAt = rs.getTimestamp("created_at").toInstant();
            
            String snapshotJson = rs.getString("snapshot_data");
            JsonNode snapshotData = objectMapper.readTree(snapshotJson);
            
            return new Snapshot(aggregateId, aggregateType, sequenceNumber, snapshotData, createdAt);
        } catch (Exception e) {
            throw new RuntimeException("Failed to map snapshot from database", e);
        }
    }
    
    private AggregateType getAggregateType(AggregateRoot aggregate) {
        // Determine aggregate type from class name
        String className = aggregate.getClass().getSimpleName();
        return AggregateType.of(className);
    }
}
