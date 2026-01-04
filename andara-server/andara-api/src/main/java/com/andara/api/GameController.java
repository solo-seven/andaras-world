package com.andara.api;

import com.andara.application.game.StartNewGameCommand;
import com.andara.application.game.StartNewGameCommandHandler;
import com.andara.domain.party.Appearance;
import com.andara.domain.party.Attributes;
import com.andara.domain.party.Origin;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for game management operations.
 */
@RestController
@RequestMapping("/api/v1/game")
public class GameController {

    private final StartNewGameCommandHandler startNewGameCommandHandler;

    public GameController(StartNewGameCommandHandler startNewGameCommandHandler) {
        this.startNewGameCommandHandler = startNewGameCommandHandler;
    }

    /**
     * Start a new game instance with character creation.
     * POST /api/v1/game/start
     */
    @PostMapping("/start")
    public ResponseEntity<?> startNewGame(@RequestBody StartNewGameRequest request) {
        try {
            // Generate agent ID (for now, single local player)
            UUID agentId = UUID.randomUUID();

            // Validate and parse request
            StartNewGameCommand command = new StartNewGameCommand(
                request.name(),
                Origin.valueOf(request.origin()),
                Attributes.create(
                    request.attributes().strength(),
                    request.attributes().agility(),
                    request.attributes().endurance(),
                    request.attributes().intellect(),
                    request.attributes().perception(),
                    request.attributes().charisma()
                ),
                request.skillFocuses(),
                parseAppearance(request.appearance()),
                agentId
            );

            // Handle command
            StartNewGameCommandHandler.StartNewGameResponse response =
                startNewGameCommandHandler.handle(command);

            // Return response
            return ResponseEntity.ok(Map.of(
                "success", true,
                "instanceId", response.instanceId().toString(),
                "partyId", response.partyId().toString(),
                "characterId", response.characterId().toString()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to start new game: " + e.getMessage()));
        }
    }

    private Appearance parseAppearance(AppearanceRequest appearance) {
        if (appearance == null) {
            return Appearance.defaultAppearance();
        }
        
        // Map frontend bodyType to backend BodyType enum
        Appearance.BodyType bodyType;
        if (appearance.bodyType() != null) {
            try {
                // Map MASCULINE/FEMININE/NEUTRAL to SLENDER/AVERAGE/STOCKY
                bodyType = switch (appearance.bodyType().toUpperCase()) {
                    case "MASCULINE" -> Appearance.BodyType.STOCKY;
                    case "FEMININE" -> Appearance.BodyType.SLENDER;
                    case "NEUTRAL" -> Appearance.BodyType.AVERAGE;
                    default -> Appearance.BodyType.AVERAGE;
                };
            } catch (Exception e) {
                bodyType = Appearance.BodyType.AVERAGE;
            }
        } else {
            bodyType = Appearance.BodyType.AVERAGE;
        }
        
        // For now, use OTHER gender (frontend doesn't send gender directly)
        return Appearance.create(
            Appearance.Gender.OTHER,
            bodyType
        );
    }

    // Request DTOs
    public record StartNewGameRequest(
        String name,
        String origin,
        AttributesRequest attributes,
        List<String> skillFocuses,
        AppearanceRequest appearance
    ) {}

    public record AttributesRequest(
        int strength,
        int agility,
        int endurance,
        int intellect,
        int perception,
        int charisma
    ) {}

    public record AppearanceRequest(
        String bodyType,
        String hairStyle,
        String hairColor,
        String skinTone,
        String eyeColor,
        Integer ageAppearance,
        String scarsMarks
    ) {}
}
