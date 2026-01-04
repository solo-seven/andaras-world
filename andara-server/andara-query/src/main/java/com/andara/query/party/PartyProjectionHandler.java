package com.andara.query.party;

import com.andara.domain.DomainEvent;
import com.andara.domain.game.events.InstanceCreated;
import com.andara.domain.party.events.CharacterCreated;
import com.andara.domain.party.events.PartyCreated;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Kafka consumer that projects domain events to read models.
 */
@Component
public class PartyProjectionHandler {

    private static final Logger log = LoggerFactory.getLogger(PartyProjectionHandler.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public PartyProjectionHandler(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "andara.events.party", groupId = "party-projection-handler")
    @Transactional
    public void handleEvent(String eventJson) {
        try {
            Map<String, Object> eventEnvelope = objectMapper.readValue(eventJson, Map.class);
            String eventType = (String) eventEnvelope.get("eventType");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = (Map<String, Object>) eventEnvelope.get("payload");
            @SuppressWarnings("unchecked")
            Map<String, String> metadata = (Map<String, String>) eventEnvelope.get("metadata");

            switch (eventType) {
                case "InstanceCreated" -> handleInstanceCreated(payload, metadata);
                case "PartyCreated" -> handlePartyCreated(payload, metadata);
                case "CharacterCreated" -> handleCharacterCreated(payload, metadata);
                default -> log.debug("Ignoring event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing event: {}", eventJson, e);
            throw new RuntimeException("Failed to process event", e);
        }
    }

    private void handleInstanceCreated(Map<String, Object> payload, Map<String, String> metadata) {
        UUID instanceId = UUID.fromString((String) payload.get("instanceId"));
        UUID ownerAgentId = UUID.fromString((String) payload.get("ownerAgentId"));

        jdbcTemplate.update(
            """
            INSERT INTO instances (instance_id, owner_agent_id, created_at, status)
            VALUES (?, ?, ?, ?)
            ON CONFLICT (instance_id) DO NOTHING
            """,
            instanceId,
            ownerAgentId,
            Timestamp.from(Instant.now()),
            "active"
        );

        log.debug("Projected InstanceCreated: {}", instanceId);
    }

    private void handlePartyCreated(Map<String, Object> payload, Map<String, String> metadata) {
        UUID partyId = UUID.fromString((String) payload.get("partyId"));
        UUID instanceId = UUID.fromString((String) payload.get("instanceId"));
        UUID protagonistId = UUID.fromString((String) payload.get("protagonistId"));

        Map<String, Object> partyData = new HashMap<>();
        partyData.put("protagonistId", protagonistId.toString());

        // Check if instance exists before inserting party (handles out-of-order events)
        // Even with partition key routing, this provides additional safety
        Boolean instanceExists = jdbcTemplate.queryForObject(
            "SELECT EXISTS(SELECT 1 FROM instances WHERE instance_id = ?)",
            Boolean.class,
            instanceId
        );

        if (Boolean.FALSE.equals(instanceExists)) {
            log.warn("Instance {} does not exist yet for PartyCreated event {}. " +
                "This may indicate out-of-order event delivery. Retrying later.", instanceId, partyId);
            // Throw exception to trigger Kafka retry - event will be redelivered
            throw new RuntimeException("Instance " + instanceId + " does not exist yet. " +
                "PartyCreated event will be retried after InstanceCreated is processed.");
        }

        try {
            jdbcTemplate.update(
                """
                INSERT INTO party_view (party_id, instance_id, member_count, data, updated_at)
                VALUES (?, ?, ?, ?::jsonb, ?)
                ON CONFLICT (party_id) DO UPDATE SET
                    instance_id = EXCLUDED.instance_id,
                    member_count = EXCLUDED.member_count,
                    data = EXCLUDED.data,
                    updated_at = EXCLUDED.updated_at
                """,
                partyId,
                instanceId,
                1, // Initial member count (protagonist only)
                objectMapper.writeValueAsString(partyData),
                Timestamp.from(Instant.now())
            );
            log.debug("Projected PartyCreated: {}", partyId);
        } catch (Exception e) {
            log.error("Error projecting PartyCreated for party {}", partyId, e);
            throw new RuntimeException("Failed to project PartyCreated", e);
        }
    }

    private void handleCharacterCreated(Map<String, Object> payload, Map<String, String> metadata) {
        UUID characterId = UUID.fromString((String) payload.get("characterId"));
        UUID partyId = UUID.fromString((String) payload.get("partyId"));
        String name = (String) payload.get("name");
        String origin = (String) payload.get("origin");
        Boolean isProtagonist = (Boolean) payload.get("isProtagonist");

        // Build attributes JSON
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("strength", payload.get("strength"));
        attributes.put("agility", payload.get("agility"));
        attributes.put("endurance", payload.get("endurance"));
        attributes.put("intellect", payload.get("intellect"));
        attributes.put("perception", payload.get("perception"));
        attributes.put("charisma", payload.get("charisma"));

        // Skills JSON (from startingSkills map)
        @SuppressWarnings("unchecked")
        Map<String, Integer> startingSkills = (Map<String, Integer>) payload.get("startingSkills");

        // Appearance JSON
        Map<String, Object> appearance = new HashMap<>();
        appearance.put("gender", payload.get("gender"));
        appearance.put("bodyType", payload.get("bodyType"));

        try {
            jdbcTemplate.update(
                """
                INSERT INTO character_view (
                    character_id, party_id, name, origin, is_protagonist,
                    attributes, skills, appearance, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?)
                ON CONFLICT (character_id) DO UPDATE SET
                    party_id = EXCLUDED.party_id,
                    name = EXCLUDED.name,
                    origin = EXCLUDED.origin,
                    is_protagonist = EXCLUDED.is_protagonist,
                    attributes = EXCLUDED.attributes,
                    skills = EXCLUDED.skills,
                    appearance = EXCLUDED.appearance,
                    updated_at = EXCLUDED.updated_at
                """,
                characterId,
                partyId,
                name,
                origin,
                isProtagonist,
                objectMapper.writeValueAsString(attributes),
                objectMapper.writeValueAsString(startingSkills),
                objectMapper.writeValueAsString(appearance),
                Timestamp.from(Instant.now())
            );

            log.debug("Projected CharacterCreated: {}", characterId);
        } catch (Exception e) {
            log.error("Error projecting CharacterCreated for character {}", characterId, e);
            throw new RuntimeException("Failed to project CharacterCreated", e);
        }
    }
}
