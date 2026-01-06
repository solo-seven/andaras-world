package com.andara.application.party;

import com.andara.application.command.CommandHandler;
import com.andara.application.command.CommandHandlerAnnotation;
import com.andara.common.Result;
import com.andara.infrastructure.CharacterRepository;
import com.andara.domain.DomainEvent;
import com.andara.domain.party.Character;
import com.andara.domain.party.CharacterId;
import com.andara.domain.party.CharacterName;
import com.andara.domain.party.SkillId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Command handler for creating characters.
 */
@Component
@CommandHandlerAnnotation
public class CreateCharacterCommandHandler implements CommandHandler<CreateCharacterCommand> {

    private final CharacterRepository characterRepository;

    public CreateCharacterCommandHandler(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    public Result<List<DomainEvent>> handle(CreateCharacterCommand command) {
        try {
            // Validate command (constructor already validates, but we catch exceptions)
            // Convert skill focus strings to SkillIds
            List<SkillId> skillFocuses = command.skillFocuses().stream()
                .map(SkillId::of)
                .collect(Collectors.toList());

            // Create value objects
            CharacterId characterId = CharacterId.random();
            CharacterName name = CharacterName.of(command.name());

            // Create character aggregate
            Character character = Character.create(
                characterId,
                name,
                command.origin(),
                command.attributes(),
                skillFocuses,
                command.appearance(),
                command.isProtagonist(),
                command.instanceId(),
                command.partyId(),
                command.agentId()
            );

            // Collect events before saving (repository will mark as committed)
            List<DomainEvent> events = character.getUncommittedEvents();

            // Save character (repository handles event persistence AND publishing)
            characterRepository.save(character);

            // Return events that were saved and published
            return Result.success(events);
        } catch (IllegalArgumentException e) {
            return Result.failure(e.getMessage());
        } catch (Exception e) {
            return Result.failure("Failed to create character: " + e.getMessage());
        }
    }
}

