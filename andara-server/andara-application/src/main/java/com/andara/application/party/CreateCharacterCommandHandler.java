package com.andara.application.party;

import com.andara.common.Result;
import com.andara.infrastructure.CharacterRepository;
import com.andara.infrastructure.EventPublisher;
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
public class CreateCharacterCommandHandler {

    private final CharacterRepository characterRepository;
    private final EventPublisher eventPublisher;

    public CreateCharacterCommandHandler(
        CharacterRepository characterRepository,
        EventPublisher eventPublisher
    ) {
        this.characterRepository = characterRepository;
        this.eventPublisher = eventPublisher;
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

            // Save character
            characterRepository.save(character);

            // Get uncommitted events
            List<DomainEvent> events = character.getUncommittedEvents();
            character.markCommitted();

            // Publish events
            eventPublisher.publish(events);

            return Result.success(events);
        } catch (IllegalArgumentException e) {
            return Result.failure(e.getMessage());
        } catch (Exception e) {
            return Result.failure("Failed to create character: " + e.getMessage());
        }
    }
}

