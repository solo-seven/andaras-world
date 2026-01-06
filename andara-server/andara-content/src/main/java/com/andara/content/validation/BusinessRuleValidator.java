package com.andara.content.validation;

import com.andara.content.ContentType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Validates business rules and balance constraints for content.
 */
public class BusinessRuleValidator {
    private static final Logger log = LoggerFactory.getLogger(BusinessRuleValidator.class);
    
    private final ObjectMapper objectMapper;

    public BusinessRuleValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ValidationResult validate(ContentType contentType, Object content) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        JsonNode contentNode = objectMapper.valueToTree(content);
        
        switch (contentType) {
            case ITEM_TEMPLATE -> validateItemTemplate(contentNode, errors, warnings);
            case SKILL_DEFINITION -> validateSkillDefinition(contentNode, errors, warnings);
            case RECIPE -> validateRecipe(contentNode, errors, warnings);
            case ABILITY_DEFINITION -> validateAbilityDefinition(contentNode, errors, warnings);
            default -> {
                // No specific business rules for other types yet
            }
        }
        
        if (!errors.isEmpty()) {
            return ValidationResult.failure(errors);
        } else if (!warnings.isEmpty()) {
            return ValidationResult.withWarnings(warnings);
        }
        
        return ValidationResult.success();
    }

    private void validateItemTemplate(JsonNode node, List<String> errors, List<String> warnings) {
        String category = node.path("category").asText();
        JsonNode properties = node.path("properties");
        
        if ("weapon".equals(category)) {
            JsonNode weaponProps = properties.path("weapon");
            if (!weaponProps.isMissingNode()) {
                int damageMin = weaponProps.path("damageMin").asInt(0);
                int damageMax = weaponProps.path("damageMax").asInt(0);
                
                if (damageMin > damageMax) {
                    errors.add("Weapon minimum damage (" + damageMin + ") cannot exceed maximum damage (" + damageMax + ")");
                }
                
                int baseValue = node.path("baseValue").asInt(0);
                if (damageMax > 0 && baseValue > 0 && baseValue < damageMax * 10) {
                    warnings.add("Weapon may be underpriced relative to damage output (value: " + baseValue + ", damageMax: " + damageMax + ")");
                } else if (damageMax > 0 && baseValue > damageMax * 100) {
                    warnings.add("Weapon may be overpriced relative to damage output (value: " + baseValue + ", damageMax: " + damageMax + ")");
                }
            }
        } else if ("armor".equals(category)) {
            JsonNode armorProps = properties.path("armor");
            if (!armorProps.isMissingNode()) {
                int armorValue = armorProps.path("armorValue").asInt(0);
                int baseValue = node.path("baseValue").asInt(0);
                
                if (armorValue > 0 && baseValue > 0 && baseValue < armorValue * 5) {
                    warnings.add("Armor may be underpriced relative to protection (value: " + baseValue + ", armor: " + armorValue + ")");
                }
            }
        }
    }

    private void validateSkillDefinition(JsonNode node, List<String> errors, List<String> warnings) {
        JsonNode abilityUnlocks = node.path("abilityUnlocks");
        if (abilityUnlocks.isArray()) {
            int lastProficiency = -1;
            for (JsonNode unlock : abilityUnlocks) {
                int proficiency = unlock.path("proficiency").asInt(0);
                if (proficiency <= lastProficiency) {
                    errors.add("Ability unlock proficiencies must be in strictly ascending order. Found " + proficiency + " after " + lastProficiency);
                }
                lastProficiency = proficiency;
            }
        }
    }

    private void validateRecipe(JsonNode node, List<String> errors, List<String> warnings) {
        JsonNode inputs = node.path("inputs");
        JsonNode outputs = node.path("outputs");
        
        if (inputs.isArray() && inputs.size() == 0) {
            errors.add("Recipe must have at least one input");
        }
        
        if (outputs.isArray() && outputs.size() == 0) {
            errors.add("Recipe must have at least one output");
        }
        
        // Check for reasonable input/output ratios
        if (inputs.isArray() && outputs.isArray() && inputs.size() > 0 && outputs.size() > 0) {
            int totalInputQty = 0;
            for (JsonNode input : inputs) {
                totalInputQty += input.path("quantity").asInt(1);
            }
            
            int totalOutputQty = 0;
            for (JsonNode output : outputs) {
                totalOutputQty += output.path("quantity").asInt(1);
            }
            
            if (totalOutputQty > totalInputQty * 10) {
                warnings.add("Recipe produces significantly more output than input (output: " + totalOutputQty + ", input: " + totalInputQty + ")");
            }
        }
        
        int skillLevel = node.path("skillLevel").asInt(0);
        if (skillLevel < 0 || skillLevel > 100) {
            errors.add("Recipe skillLevel must be between 0 and 100");
        }
    }

    private void validateAbilityDefinition(JsonNode node, List<String> errors, List<String> warnings) {
        String type = node.path("type").asText();
        
        if ("active".equals(type)) {
            int apCost = node.path("apCost").asInt(-1);
            if (apCost < 0) {
                errors.add("Active abilities must have apCost specified");
            } else if (apCost > 20) {
                warnings.add("Ability has very high AP cost (" + apCost + "), may be difficult to use");
            }
        }
        
        JsonNode effects = node.path("effects");
        if (effects.isArray() && effects.size() == 0 && "active".equals(type)) {
            warnings.add("Active ability has no effects defined");
        }
    }
}
