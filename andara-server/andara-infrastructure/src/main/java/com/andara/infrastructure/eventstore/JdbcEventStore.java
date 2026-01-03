package com.andara.infrastructure.eventstore;

import com.andara.domain.DomainEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    public void append(String aggregateId, String aggregateType, List<DomainEvent> events) {
        for (DomainEvent event : events) {
            long sequenceNumber = getNextSequenceNumber(aggregateId, aggregateType);
            
            try {
                String payloadJson = objectMapper.writeValueAsString(event.getPayload());
                String metadataJson = objectMapper.writeValueAsString(event.getMetadata());
                
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
                    UUID.fromString(event.getMetadata().get("instanceId")),
                    UUID.fromString(event.getMetadata().get("agentId")),
                    sequenceNumber,
                    Timestamp.from(event.getTimestamp()),
                    payloadJson,
                    metadataJson
                );
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize event", e);
            }
        }
    }

    @Override
    public List<DomainEvent> getEvents(String aggregateId, String aggregateType) {
        return jdbcTemplate.query(
            """
            SELECT event_id, event_type, aggregate_id, aggregate_type,
                   instance_id, agent_id, sequence_number, timestamp,
                   payload, metadata
            FROM domain_events
            WHERE aggregate_id = ? AND aggregate_type = ?
            ORDER BY sequence_number
            """,
            this::mapRowToEvent,
            aggregateId,
            aggregateType
        );
    }

    @Override
    public boolean hasEvents(String aggregateId, String aggregateType) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM domain_events WHERE aggregate_id = ? AND aggregate_type = ?",
            Integer.class,
            aggregateId,
            aggregateType
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

