package com.andara.content;

import java.util.Arrays;

/**
 * Enumeration of all supported content types in the content management system.
 */
public enum ContentType {
    ITEM_TEMPLATE("item-template", "ItemTemplate"),
    SKILL_DEFINITION("skill-definition", "SkillDefinition"),
    ABILITY_DEFINITION("ability-definition", "AbilityDefinition"),
    RECIPE("recipe", "Recipe"),
    REGION_DEFINITION("region-definition", "RegionDefinition"),
    ZONE_TEMPLATE("zone-template", "ZoneTemplate"),
    POI_TEMPLATE("poi-template", "POITemplate"),
    NPC_TEMPLATE("npc-template", "NPCTemplate"),
    FACTION_DEFINITION("faction-definition", "FactionDefinition"),
    ENCOUNTER_TEMPLATE("encounter-template", "EncounterTemplate"),
    DIALOGUE_TREE("dialogue-tree", "DialogueTree");

    private final String schemaFileName;
    private final String schemaTitle;

    ContentType(String schemaFileName, String schemaTitle) {
        this.schemaFileName = schemaFileName;
        this.schemaTitle = schemaTitle;
    }

    public String getSchemaFileName() {
        return schemaFileName;
    }

    public String getSchemaTitle() {
        return schemaTitle;
    }

    /**
     * Get the schema file path relative to the content-schemas directory.
     */
    public String getSchemaPath() {
        return schemaFileName + ".json";
    }

    /**
     * Find ContentType by schema file name.
     */
    public static ContentType fromSchemaFileName(String fileName) {
        String baseName = fileName.replace(".json", "");
        return Arrays.stream(values())
            .filter(type -> type.schemaFileName.equals(baseName))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown schema file: " + fileName));
    }
}
