package com.andara.content.validation;

import com.andara.content.ContentType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.function.Function;

/**
 * Validates foreign key references in content (itemIds, skillIds, etc.)
 */
public class ReferenceValidator {
    private static final Logger log = LoggerFactory.getLogger(ReferenceValidator.class);
    
    private final ObjectMapper objectMapper;
    private final ReferenceResolver referenceResolver;

    public ReferenceValidator(ObjectMapper objectMapper, ReferenceResolver referenceResolver) {
        this.objectMapper = objectMapper;
        this.referenceResolver = referenceResolver;
    }

    public ValidationResult validate(ContentType contentType, Object content) {
        List<String> errors = new ArrayList<>();
        JsonNode contentNode = objectMapper.valueToTree(content);
        
        // Special handling for dialogue trees due to nested structure
        if (contentType == ContentType.DIALOGUE_TREE) {
            validateDialogueTree(contentNode, errors);
        } else {
            // Define reference fields for each content type
            Map<ContentType, List<ReferenceField>> referenceFields = getReferenceFields();
            List<ReferenceField> fields = referenceFields.getOrDefault(contentType, Collections.emptyList());
            
            for (ReferenceField field : fields) {
                validateReference(contentNode, field, errors);
            }
        }
        
        return errors.isEmpty() ? ValidationResult.success() : ValidationResult.failure(errors);
    }

    /**
     * Special validation for dialogue trees due to nested node structure.
     */
    private void validateDialogueTree(JsonNode dialogueTree, List<String> errors) {
        JsonNode nodes = dialogueTree.path("nodes");
        if (!nodes.isArray()) {
            return;
        }
        
        // Collect all valid node IDs
        Set<String> validNodeIds = new HashSet<>();
        for (JsonNode node : nodes) {
            JsonNode nodeId = node.path("nodeId");
            if (nodeId.isTextual()) {
                validNodeIds.add(nodeId.asText());
            }
        }
        
        // Validate nextNodeId references in each node
        for (JsonNode node : nodes) {
            // Check direct nextNodeId field
            JsonNode nextNodeId = node.path("nextNodeId");
            if (nextNodeId.isTextual()) {
                String refId = nextNodeId.asText();
                if (!refId.isEmpty() && !validNodeIds.contains(refId)) {
                    errors.add(String.format(
                        "Reference validation error: Node '%s' references non-existent nextNodeId: %s",
                        node.path("nodeId").asText("unknown"),
                        refId
                    ));
                }
            }
            
            // Check nextNodeId in choices array
            JsonNode choices = node.path("choices");
            if (choices.isArray()) {
                for (JsonNode choice : choices) {
                    JsonNode choiceNextNodeId = choice.path("nextNodeId");
                    if (choiceNextNodeId.isTextual()) {
                        String refId = choiceNextNodeId.asText();
                        if (!refId.isEmpty() && !validNodeIds.contains(refId)) {
                            errors.add(String.format(
                                "Reference validation error: Choice in node '%s' references non-existent nextNodeId: %s",
                                node.path("nodeId").asText("unknown"),
                                refId
                            ));
                        }
                    }
                }
            }
        }
    }

    private void validateReference(JsonNode node, ReferenceField field, List<String> errors) {
        JsonNode targetNode = node.at(field.getPath());
        
        if (targetNode.isMissingNode()) {
            return; // Optional field
        }
        
        if (targetNode.isArray()) {
            for (JsonNode item : targetNode) {
                if (item.isObject() && item.has(field.getReferenceFieldName())) {
                    String refId = item.get(field.getReferenceFieldName()).asText();
                    if (!referenceResolver.exists(field.getTargetType(), refId)) {
                        errors.add(String.format(
                            "Reference validation error: %s at path '%s' references non-existent %s: %s",
                            field.getReferenceFieldName(),
                            field.getPath(),
                            field.getTargetType(),
                            refId
                        ));
                    }
                } else if (item.isTextual()) {
                    String refId = item.asText();
                    if (!referenceResolver.exists(field.getTargetType(), refId)) {
                        errors.add(String.format(
                            "Reference validation error: Path '%s' contains non-existent %s: %s",
                            field.getPath(),
                            field.getTargetType(),
                            refId
                        ));
                    }
                }
            }
        } else if (targetNode.isTextual()) {
            String refId = targetNode.asText();
            if (!refId.isEmpty() && !referenceResolver.exists(field.getTargetType(), refId)) {
                errors.add(String.format(
                    "Reference validation error: Path '%s' references non-existent %s: %s",
                    field.getPath(),
                    field.getTargetType(),
                    refId
                ));
            }
        }
    }

    private Map<ContentType, List<ReferenceField>> getReferenceFields() {
        Map<ContentType, List<ReferenceField>> fields = new HashMap<>();
        
        // Recipe references
        fields.put(ContentType.RECIPE, Arrays.asList(
            new ReferenceField("/skillRequired", "skillId", ContentType.SKILL_DEFINITION),
            new ReferenceField("/inputs", "itemTemplateId", ContentType.ITEM_TEMPLATE, "itemTemplateId"),
            new ReferenceField("/outputs", "itemTemplateId", ContentType.ITEM_TEMPLATE, "itemTemplateId")
        ));
        
        // Skill references
        fields.put(ContentType.SKILL_DEFINITION, Arrays.asList(
            new ReferenceField("/abilityUnlocks", "abilityId", ContentType.ABILITY_DEFINITION, "abilityId")
        ));
        
        // Region references
        fields.put(ContentType.REGION_DEFINITION, Arrays.asList(
            new ReferenceField("/zones", "zoneId", ContentType.ZONE_TEMPLATE, "zoneId")
        ));
        
        // Zone references
        fields.put(ContentType.ZONE_TEMPLATE, Arrays.asList(
            new ReferenceField("/pointsOfInterest", "poiId", ContentType.POI_TEMPLATE, "poiId")
        ));
        
        // POI references
        fields.put(ContentType.POI_TEMPLATE, Arrays.asList(
            new ReferenceField("/lootTable", "itemTemplateId", ContentType.ITEM_TEMPLATE, "itemTemplateId"),
            new ReferenceField("/encounters", "encounterId", ContentType.ENCOUNTER_TEMPLATE),
            new ReferenceField("/requiredSkill/skillId", "skillId", ContentType.SKILL_DEFINITION)
        ));
        
        // NPC references
        fields.put(ContentType.NPC_TEMPLATE, Arrays.asList(
            new ReferenceField("/factionId", "factionId", ContentType.FACTION_DEFINITION),
            new ReferenceField("/dialogueTreeId", "dialogueTreeId", ContentType.DIALOGUE_TREE),
            new ReferenceField("/inventory", "itemTemplateId", ContentType.ITEM_TEMPLATE, "itemTemplateId")
        ));
        
        // Encounter references
        fields.put(ContentType.ENCOUNTER_TEMPLATE, Arrays.asList(
            new ReferenceField("/participants", "npcTemplateId", ContentType.NPC_TEMPLATE, "npcTemplateId"),
            new ReferenceField("/rewards/items", "itemTemplateId", ContentType.ITEM_TEMPLATE, "itemTemplateId")
        ));
        
        // Dialogue tree references - handled specially due to nested structure
        fields.put(ContentType.DIALOGUE_TREE, Collections.emptyList());
        
        return fields;
    }

    /**
     * Interface for resolving whether a reference exists.
     */
    public interface ReferenceResolver {
        boolean exists(ContentType type, String id);
    }

    /**
     * Represents a reference field to validate.
     */
    private static class ReferenceField {
        private final String path;
        private final String referenceFieldName;
        private final ContentType targetType;
        private final String idFieldName;

        ReferenceField(String path, String referenceFieldName, ContentType targetType) {
            this(path, referenceFieldName, targetType, referenceFieldName);
        }

        ReferenceField(String path, String referenceFieldName, ContentType targetType, String idFieldName) {
            this.path = path;
            this.referenceFieldName = referenceFieldName;
            this.targetType = targetType;
            this.idFieldName = idFieldName;
        }

        String getPath() {
            return path;
        }

        String getReferenceFieldName() {
            return referenceFieldName;
        }

        ContentType getTargetType() {
            return targetType;
        }

        String getIdFieldName() {
            return idFieldName;
        }
    }
}
