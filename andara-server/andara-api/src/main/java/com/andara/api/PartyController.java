package com.andara.api;

import com.andara.query.party.PartyQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for party and character queries.
 */
@RestController
@RequestMapping("/api/v1")
public class PartyController {

    private final PartyQueryService partyQueryService;

    public PartyController(PartyQueryService partyQueryService) {
        this.partyQueryService = partyQueryService;
    }

    /**
     * Get party by ID.
     * GET /api/v1/party/{partyId}
     */
    @GetMapping("/party/{partyId}")
    public ResponseEntity<?> getParty(@PathVariable String partyId) {
        try {
            UUID partyUuid = UUID.fromString(partyId);
            PartyQueryService.PartyView party = partyQueryService.getPartyById(partyUuid);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "party", Map.of(
                    "partyId", party.partyId().toString(),
                    "instanceId", party.instanceId().toString(),
                    "memberCount", party.memberCount(),
                    "positionRegion", party.positionRegion() != null ? party.positionRegion() : "",
                    "positionZone", party.positionZone() != null ? party.positionZone() : "",
                    "data", party.data()
                )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", "Invalid party ID: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get character by ID.
     * GET /api/v1/characters/{characterId}
     */
    @GetMapping("/characters/{characterId}")
    public ResponseEntity<?> getCharacter(@PathVariable String characterId) {
        try {
            UUID characterUuid = UUID.fromString(characterId);
            PartyQueryService.CharacterView character = partyQueryService.getCharacterById(characterUuid);
            
            Map<String, Object> characterMap = new HashMap<>();
            characterMap.put("characterId", character.characterId().toString());
            characterMap.put("partyId", character.partyId().toString());
            characterMap.put("name", character.name());
            characterMap.put("origin", character.origin());
            characterMap.put("isProtagonist", character.isProtagonist());
            characterMap.put("health", Map.of(
                "current", character.healthCurrent(),
                "max", character.healthMax()
            ));
            characterMap.put("status", character.status());
            characterMap.put("attributes", character.attributes());
            characterMap.put("skills", character.skills());
            characterMap.put("appearance", character.appearance() != null ? character.appearance() : Map.of());
            characterMap.put("equipment", character.equipment());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "character", characterMap
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", "Invalid character ID: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
