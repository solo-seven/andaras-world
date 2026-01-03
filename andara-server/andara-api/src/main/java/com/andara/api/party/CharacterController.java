package com.andara.api.party;

import com.andara.application.party.CharacterService;
import com.andara.application.party.CreateCharacterCommand;
import com.andara.application.party.OriginDefinition;
import com.andara.common.Result;
import com.andara.domain.DomainEvent;
import com.andara.domain.party.Attributes;
import com.andara.domain.party.Origin;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for character operations.
 */
@RestController
@RequestMapping("/api/v1/characters")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @PostMapping
    public ResponseEntity<?> createCharacter(@Valid @RequestBody CreateCharacterRequestDto request) {
        // Convert DTO to command
        Attributes attributes = Attributes.create(
            request.attributes().strength(),
            request.attributes().agility(),
            request.attributes().endurance(),
            request.attributes().intellect(),
            request.attributes().perception(),
            request.attributes().charisma()
        );

        CreateCharacterCommand command = new CreateCharacterCommand(
            request.name(),
            request.origin(),
            attributes,
            request.skillFocuses(),
            request.appearance().toDomain(),
            request.isProtagonist(),
            request.instanceId(),
            request.agentId()
        );

        Result<List<DomainEvent>> result = characterService.createCharacter(command);

        if (result.isSuccess()) {
            // Extract character ID from first event
            DomainEvent firstEvent = result.getData().get(0);
            String characterId = firstEvent.getAggregateId();

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "success", true,
                    "characterId", characterId,
                    "message", "Character created successfully"
                ));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "success", false,
                    "errors", result.getErrors()
                ));
        }
    }

    @GetMapping("/origins")
    public ResponseEntity<List<OriginDto>> getOrigins() {
        List<OriginDto> origins = Arrays.stream(Origin.values())
            .map(origin -> new OriginDto(
                origin.name(),
                origin.getDisplayName(),
                origin.getDescription()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(origins);
    }

    @GetMapping("/skills")
    public ResponseEntity<List<SkillDto>> getSkills() {
        // For prototype, return a basic list of skills
        // In full implementation, this would come from a service/repository
        List<SkillDto> skills = List.of(
            new SkillDto("mechanics", "Mechanics", "TECHNICAL", "Physical construction and repair"),
            new SkillDto("electronics", "Electronics", "TECHNICAL", "Circuits, hacking, sensors"),
            new SkillDto("chemistry", "Chemistry", "TECHNICAL", "Compounds, medicine, explosives"),
            new SkillDto("engineering", "Engineering", "TECHNICAL", "Complex design and efficiency"),
            new SkillDto("scavenging", "Scavenging", "SURVIVAL", "Finding resources"),
            new SkillDto("tracking", "Tracking", "SURVIVAL", "Following trails and hunting"),
            new SkillDto("medicine", "Medicine", "SURVIVAL", "Healing and treating injuries"),
            new SkillDto("navigation", "Navigation", "SURVIVAL", "Travel efficiency and orientation"),
            new SkillDto("melee", "Melee", "COMBAT", "Close combat with weapons"),
            new SkillDto("ranged", "Ranged", "COMBAT", "Firearms and thrown weapons"),
            new SkillDto("rift_manipulation", "Rift Manipulation", "ARCANE", "Direct energy control"),
            new SkillDto("perception", "Perception", "ARCANE", "Magical sensing and knowledge")
        );

        return ResponseEntity.ok(skills);
    }
}

