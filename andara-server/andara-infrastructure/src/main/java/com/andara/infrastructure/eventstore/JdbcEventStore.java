package com.andara.infrastructure.eventstore;

import com.andara.domain.AggregateId;
import com.andara.domain.AggregateType;
import com.andara.domain.ConcurrencyException;
import com.andara.domain.DomainEvent;
import com.andara.domain.game.InstanceId;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

/**
 * JDBC implementation of event store.
 * Stores events in PostgreSQL with optimistic locking via unique constraint.
 */
@Component
public class JdbcEventStore implements EventStore {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public JdbcEventStore(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void append(List<DomainEvent> events) {
        if (events.isEmpty()) {
            return;
        }

        // Group events by aggregate to calculate sequence numbers correctly
        Map<String, Map<String, Long>> sequenceNumbers = new HashMap<>();
        
        for (DomainEvent event : events) {
            String aggregateId = event.getAggregateId();
            String aggregateType = event.getAggregateType();
            
            // Get or calculate next sequence number for this aggregate
            sequenceNumbers.computeIfAbsent(aggregateId, id -> new HashMap<>())
                .computeIfAbsent(aggregateType, type -> getNextSequenceNumber(aggregateId, aggregateType));
            
            long sequenceNumber = sequenceNumbers.get(aggregateId).get(aggregateType);
            
            try {
                String payloadJson = objectMapper.writeValueAsString(event.getPayload());
                String metadataJson = objectMapper.writeValueAsString(event.getMetadata());
                
                // Extract instanceId and agentId from metadata
                // Handle "system" string for system operations (content events)
                String instanceIdStr = event.getMetadata().get("instanceId");
                String agentIdStr = event.getMetadata().get("agentId");
                UUID instanceId = parseUuidOrNull(instanceIdStr);
                UUID agentId = parseUuidOrNull(agentIdStr);
                
                jdbcTemplate.update(
                    """
                    INSERT INTO domain_events (
                        event_id, event_type, aggregate_id, aggregate_type,
                        instance_id, agent_id, sequence_number, timestamp,
                        payload, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb)
                    """,
                    event.getEventId(),
                    event.getEventType(),
                    aggregateId,
                    aggregateType,
                    instanceId,
                    agentId,
                    sequenceNumber,
                    Timestamp.from(event.getTimestamp()),
                    payloadJson,
                    metadataJson
                );
                
                // Increment sequence number for next event in same aggregate
                sequenceNumbers.get(aggregateId).put(aggregateType, sequenceNumber + 1);
            } catch (DataIntegrityViolationException e) {
                // Unique constraint violation indicates concurrency conflict
                throw new ConcurrencyException(
                    String.format("Concurrency conflict: event with sequence %d already exists for aggregate %s/%s",
                        sequenceNumber, aggregateType, aggregateId),
                    e
                );
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize event", e);
            } catch (Exception e) {
                if (e instanceof ConcurrencyException) {
                    throw e;
                }
                throw new RuntimeException("Failed to append event", e);
            }
        }
    }

    @Override
    public List<DomainEvent> getEvents(AggregateId id, AggregateType type) {
        return getEvents(id, type, 0L);
    }

    @Override
    public List<DomainEvent> getEvents(AggregateId id, AggregateType type, long fromSequence) {
        return jdbcTemplate.query(
            """
            SELECT event_id, event_type, aggregate_id, aggregate_type,
                   instance_id, agent_id, sequence_number, timestamp,
                   payload, metadata
            FROM domain_events
            WHERE aggregate_id = ? AND aggregate_type = ? AND sequence_number > ?
            ORDER BY sequence_number
            """,
            this::mapRowToEvent,
            id.getValue(),
            type.getValue(),
            fromSequence
        );
    }

    @Override
    public Optional<UUID> getLatestEventId(InstanceId instanceId) {
        try {
            UUID result = jdbcTemplate.queryForObject(
                """
                SELECT event_id
                FROM domain_events
                WHERE instance_id = ?
                ORDER BY timestamp DESC, sequence_number DESC
                LIMIT 1
                """,
                UUID.class,
                instanceId.value()
            );
            return Optional.ofNullable(result);
        } catch (EmptyResultDataAccessException e) {
            // No events found for this instance
            return Optional.empty();
        }
    }
    
    /**
     * Parse a UUID from a string, handling "system" and null values.
     * Returns null if the string is "system" or cannot be parsed as a UUID.
     * 
     * @param uuidString String to parse
     * @return UUID or null if "system" or invalid
     */
    private UUID parseUuidOrNull(String uuidString) {
        if (uuidString == null || uuidString.equals("system")) {
            // Use a well-known system UUID for system operations
            // This allows system events to be stored while maintaining referential integrity
            return UUID.fromString("00000000-0000-0000-0000-000000000000");
        }
        try {
            return UUID.fromString(uuidString);
        } catch (IllegalArgumentException e) {
            // If it's not a valid UUID and not "system", use the system UUID as fallback
            return UUID.fromString("00000000-0000-0000-0000-000000000000");
        }
    }

    @Override
    public boolean hasEvents(AggregateId id, AggregateType type) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM domain_events WHERE aggregate_id = ? AND aggregate_type = ?",
            Integer.class,
            id.getValue(),
            type.getValue()
        );
        return count != null && count > 0;
    }

    private long getNextSequenceNumber(String aggregateId, String aggregateType) {
        Long maxSequence = jdbcTemplate.queryForObject(
            """
            SELECT COALESCE(MAX(sequence_number), 0)
            FROM domain_events
            WHERE aggregate_id = ? AND aggregate_type = ?
            """,
            Long.class,
            aggregateId,
            aggregateType
        );
        return (maxSequence != null ? maxSequence : 0L) + 1;
    }

    private DomainEvent mapRowToEvent(ResultSet rs, int rowNum) throws SQLException {
        try {
            String eventType = rs.getString("event_type");
            UUID eventId = (UUID) rs.getObject("event_id");
            Instant timestamp = rs.getTimestamp("timestamp").toInstant();
            String aggregateId = rs.getString("aggregate_id");
            String aggregateType = rs.getString("aggregate_type");
            long version = rs.getLong("sequence_number");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(
                rs.getString("payload"),
                Map.class
            );
            @SuppressWarnings("unchecked")
            Map<String, String> metadata = objectMapper.readValue(
                rs.getString("metadata"),
                Map.class
            );

            // Create a generic event implementation
            return new DomainEvent() {
                @Override
                public UUID getEventId() {
                    return eventId;
                }

                @Override
                public String getEventType() {
                    return eventType;
                }

                @Override
                public Instant getTimestamp() {
                    return timestamp;
                }

                @Override
                public String getAggregateId() {
                    return aggregateId;
                }

                @Override
                public String getAggregateType() {
                    return aggregateType;
                }

                @Override
                public long getVersion() {
                    return version;
                }

                @Override
                public Map<String, Object> getPayload() {
                    return payload;
                }

                @Override
                public Map<String, String> getMetadata() {
                    return metadata;
                }
            };
        } catch (Exception e) {
            throw new RuntimeException("Failed to map event from database", e);
        }
    }
}

