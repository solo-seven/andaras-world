package com.andara.application.content;

import com.andara.content.ContentType;
import com.andara.content.model.ContentVersion;
import com.andara.domain.content.events.ContentImported;
import com.andara.infrastructure.EventPublisher;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

/**
 * Repository service for content persistence operations.
 */
@Service
public class ContentRepositoryService {
    private static final Logger log = LoggerFactory.getLogger(ContentRepositoryService.class);
    
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final EventPublisher eventPublisher;

    public ContentRepositoryService(
        JdbcTemplate jdbcTemplate,
        ObjectMapper objectMapper,
        EventPublisher eventPublisher
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ContentVersion saveVersion(
        ContentType contentType,
        String contentId,
        Object contentData,
        String importedBy,
        String changeSummary
    ) {
        try {
            // Get next version number
            Integer currentVersion = jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(MAX(version_number), 0)
                FROM content_versions
                WHERE content_type = ? AND content_id = ?
                """,
                Integer.class,
                contentType.name(),
                contentId
            );
            
            int versionNumber = (currentVersion != null ? currentVersion : 0) + 1;
            UUID versionId = UUID.randomUUID();
            
            // Serialize content data
            String contentJson = objectMapper.writeValueAsString(contentData);
            
            // Insert version
            jdbcTemplate.update(
                """
                INSERT INTO content_versions (
                    version_id, content_type, content_id, version_number,
                    content_data, imported_at, imported_by, change_summary
                ) VALUES (?, ?, ?, ?, ?::jsonb, ?, ?, ?)
                """,
                versionId,
                contentType.name(),
                contentId,
                versionNumber,
                contentJson,
                Timestamp.from(Instant.now()),
                importedBy,
                changeSummary
            );
            
            // Activate (upsert)
            jdbcTemplate.update(
                """
                INSERT INTO active_content (content_type, content_id, version_id, activated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT (content_type, content_id)
                DO UPDATE SET version_id = EXCLUDED.version_id, activated_at = EXCLUDED.activated_at
                """,
                contentType.name(),
                contentId,
                versionId
            );
            
            log.debug("Saved content version: {} {} v{}", contentType, contentId, versionNumber);
            
            return new ContentVersion(
                versionId,
                contentType,
                contentId,
                versionNumber,
                contentData,
                null,
                Instant.now(),
                importedBy,
                changeSummary
            );
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize content data", e);
        }
    }

    public Optional<ContentVersion> findActiveVersion(ContentType contentType, String contentId) {
        return jdbcTemplate.query(
            """
            SELECT cv.version_id, cv.content_type, cv.content_id, cv.version_number,
                   cv.content_data, cv.imported_at, cv.imported_by, cv.change_summary
            FROM content_versions cv
            JOIN active_content ac ON cv.version_id = ac.version_id
            WHERE ac.content_type = ? AND ac.content_id = ?
            """,
            (rs, rowNum) -> {
                try {
                    JsonNode contentData = objectMapper.readTree(rs.getString("content_data"));
                    return new ContentVersion(
                        (UUID) rs.getObject("version_id"),
                        ContentType.valueOf(rs.getString("content_type")),
                        rs.getString("content_id"),
                        rs.getInt("version_number"),
                        objectMapper.treeToValue(contentData, Object.class),
                        null,
                        rs.getTimestamp("imported_at").toInstant(),
                        rs.getString("imported_by"),
                        rs.getString("change_summary")
                    );
                } catch (Exception e) {
                    throw new RuntimeException("Failed to deserialize content", e);
                }
            },
            contentType.name(),
            contentId
        ).stream().findFirst();
    }

    public List<ContentVersion> findAllActive(ContentType contentType) {
        return jdbcTemplate.query(
            """
            SELECT cv.version_id, cv.content_type, cv.content_id, cv.version_number,
                   cv.content_data, cv.imported_at, cv.imported_by, cv.change_summary
            FROM content_versions cv
            JOIN active_content ac ON cv.version_id = ac.version_id
            WHERE ac.content_type = ?
            ORDER BY cv.content_id
            """,
            (rs, rowNum) -> {
                try {
                    JsonNode contentData = objectMapper.readTree(rs.getString("content_data"));
                    return new ContentVersion(
                        (UUID) rs.getObject("version_id"),
                        ContentType.valueOf(rs.getString("content_type")),
                        rs.getString("content_id"),
                        rs.getInt("version_number"),
                        objectMapper.treeToValue(contentData, Object.class),
                        null,
                        rs.getTimestamp("imported_at").toInstant(),
                        rs.getString("imported_by"),
                        rs.getString("change_summary")
                    );
                } catch (Exception e) {
                    throw new RuntimeException("Failed to deserialize content", e);
                }
            },
            contentType.name()
        );
    }

    /**
     * Extract content ID from a content object based on its type.
     */
    public String extractContentId(ContentType contentType, Object content) {
        try {
            JsonNode node = objectMapper.valueToTree(content);
            return switch (contentType) {
                case ITEM_TEMPLATE -> node.path("templateId").asText();
                case SKILL_DEFINITION -> node.path("skillId").asText();
                case ABILITY_DEFINITION -> node.path("abilityId").asText();
                case RECIPE -> node.path("recipeId").asText();
                case REGION_DEFINITION -> node.path("regionId").asText();
                case ZONE_TEMPLATE -> node.path("zoneId").asText();
                case POI_TEMPLATE -> node.path("poiId").asText();
                case NPC_TEMPLATE -> node.path("npcId").asText();
                case FACTION_DEFINITION -> node.path("factionId").asText();
                case ENCOUNTER_TEMPLATE -> node.path("encounterId").asText();
                case DIALOGUE_TREE -> node.path("dialogueTreeId").asText();
            };
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract content ID", e);
        }
    }

    /**
     * Check if content with the given ID exists.
     */
    public boolean exists(ContentType contentType, String contentId) {
        Integer count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM active_content
            WHERE content_type = ? AND content_id = ?
            """,
            Integer.class,
            contentType.name(),
            contentId
        );
        return count != null && count > 0;
    }
}
