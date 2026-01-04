package com.andara.application.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing save game records.
 * Creates save game entries automatically after character creation.
 */
@Service
public class GamePersistenceService {

    private static final Logger log = LoggerFactory.getLogger(GamePersistenceService.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public GamePersistenceService(
        JdbcTemplate jdbcTemplate,
        ObjectMapper objectMapper
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Creates a save game record for an instance after character creation.
     * 
     * @param instanceId The instance ID
     * @param characterId The character ID (protagonist)
     * @param characterName The character name
     * @param origin The character origin
     * @return The created save game ID
     */
    @Transactional
    public UUID saveGame(UUID instanceId, UUID characterId, String characterName, String origin) {
        log.info("Creating save game record for instance {}, character {}", instanceId, characterId);

        // Get latest event ID for this instance
        UUID lastEventId = getLatestEventId(instanceId);
        if (lastEventId == null) {
            log.warn("No events found for instance {}, cannot create save game", instanceId);
            throw new IllegalStateException("No events found for instance " + instanceId);
        }

        // Generate save name: character name + timestamp
        String saveName = String.format("%s - %s", characterName, 
            Instant.now().toString().substring(0, 19).replace("T", " "));

        // Build metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("characterName", characterName);
        metadata.put("characterId", characterId.toString());
        metadata.put("origin", origin);
        metadata.put("playTimeSeconds", 0);
        metadata.put("createdAt", Instant.now().toString());

        // Create save record
        UUID saveId = UUID.randomUUID();
        try {
            String metadataJson = objectMapper.writeValueAsString(metadata);
            
            jdbcTemplate.update(
                """
                INSERT INTO saves (
                    save_id, instance_id, name, last_event_id, created_at, metadata
                ) VALUES (?, ?, ?, ?, ?, ?::jsonb)
                """,
                saveId,
                instanceId,
                saveName,
                lastEventId,
                Instant.now(),
                metadataJson
            );

            log.info("Successfully created save game {} for instance {}: {}", 
                saveId, instanceId, saveName);
            
            return saveId;
        } catch (Exception e) {
            log.error("Failed to create save game for instance {}", instanceId, e);
            throw new RuntimeException("Failed to create save game", e);
        }
    }

    /**
     * Gets the latest event ID for an instance.
     * 
     * @param instanceId The instance ID
     * @return The latest event ID, or null if no events exist
     */
    private UUID getLatestEventId(UUID instanceId) {
        try {
            UUID eventId = jdbcTemplate.queryForObject(
                """
                SELECT event_id
                FROM domain_events
                WHERE instance_id = ?
                ORDER BY timestamp DESC, sequence_number DESC
                LIMIT 1
                """,
                UUID.class,
                instanceId
            );
            return eventId;
        } catch (Exception e) {
            log.debug("No events found for instance {}", instanceId);
            return null;
        }
    }
}

