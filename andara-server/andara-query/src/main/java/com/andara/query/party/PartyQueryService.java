package com.andara.query.party;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Query service for party and character read models.
 */
@Service
public class PartyQueryService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public PartyQueryService(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public PartyView getPartyById(UUID partyId) {
        Map<String, Object> partyData = jdbcTemplate.queryForMap(
            """
            SELECT party_id, instance_id, position_region, position_zone,
                   member_count, total_credits, formation, data, updated_at
            FROM party_view
            WHERE party_id = ?
            """,
            partyId
        );

        return mapToPartyView(partyData);
    }

    public CharacterView getCharacterById(UUID characterId) {
        Map<String, Object> characterData = jdbcTemplate.queryForMap(
            """
            SELECT character_id, party_id, name, origin, is_protagonist,
                   health_current, health_max, status, attributes, skills,
                   appearance, equipment, updated_at
            FROM character_view
            WHERE character_id = ?
            """,
            characterId
        );

        return mapToCharacterView(characterData);
    }

    public List<CharacterView> getCharactersByPartyId(UUID partyId) {
        List<Map<String, Object>> characters = jdbcTemplate.queryForList(
            """
            SELECT character_id, party_id, name, origin, is_protagonist,
                   health_current, health_max, status, attributes, skills,
                   appearance, equipment, updated_at
            FROM character_view
            WHERE party_id = ?
            ORDER BY is_protagonist DESC, name
            """,
            partyId
        );

        return characters.stream()
            .map(this::mapToCharacterView)
            .toList();
    }

    private PartyView mapToPartyView(Map<String, Object> row) {
        try {
            return new PartyView(
                (UUID) row.get("party_id"),
                (UUID) row.get("instance_id"),
                (String) row.get("position_region"),
                (String) row.get("position_zone"),
                ((Number) row.get("member_count")).intValue(),
                ((Number) row.get("total_credits")).longValue(),
                (String) row.get("formation"),
                objectMapper.readValue((String) row.get("data"), Map.class),
                ((java.sql.Timestamp) row.get("updated_at")).toInstant()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to map party view", e);
        }
    }

    @SuppressWarnings("unchecked")
    private CharacterView mapToCharacterView(Map<String, Object> row) {
        try {
            return new CharacterView(
                (UUID) row.get("character_id"),
                (UUID) row.get("party_id"),
                (String) row.get("name"),
                (String) row.get("origin"),
                (Boolean) row.get("is_protagonist"),
                ((Number) row.get("health_current")).intValue(),
                ((Number) row.get("health_max")).intValue(),
                (String) row.get("status"),
                objectMapper.readValue((String) row.get("attributes"), Map.class),
                objectMapper.readValue((String) row.get("skills"), Map.class),
                row.get("appearance") != null 
                    ? objectMapper.readValue((String) row.get("appearance"), Map.class)
                    : null,
                objectMapper.readValue((String) row.get("equipment"), Map.class),
                ((java.sql.Timestamp) row.get("updated_at")).toInstant()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to map character view", e);
        }
    }

    public record PartyView(
        UUID partyId,
        UUID instanceId,
        String positionRegion,
        String positionZone,
        int memberCount,
        long totalCredits,
        String formation,
        Map<String, Object> data,
        java.time.Instant updatedAt
    ) {}

    public record CharacterView(
        UUID characterId,
        UUID partyId,
        String name,
        String origin,
        boolean isProtagonist,
        int healthCurrent,
        int healthMax,
        String status,
        Map<String, Object> attributes,
        Map<String, Object> skills,
        Map<String, Object> appearance,
        Map<String, Object> equipment,
        java.time.Instant updatedAt
    ) {}
}
