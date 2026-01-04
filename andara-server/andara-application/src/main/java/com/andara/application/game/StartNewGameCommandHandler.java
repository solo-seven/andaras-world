package com.andara.application.game;

import com.andara.application.persistence.GamePersistenceService;
import com.andara.infrastructure.CharacterRepository;
import com.andara.infrastructure.EventPublisher;
import com.andara.domain.DomainEvent;
import com.andara.domain.game.Instance;
import com.andara.domain.game.InstanceId;
import com.andara.domain.party.Character;
import com.andara.domain.party.CharacterId;
import com.andara.domain.party.CharacterName;
import com.andara.domain.party.Party;
import com.andara.domain.party.PartyId;
import com.andara.domain.party.SkillId;
import com.andara.infrastructure.eventstore.EventStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Command handler for starting a new game.
 * Creates Instance, Party, and Character aggregates.
 */
@Component
public class StartNewGameCommandHandler {

    private static final Logger log = LoggerFactory.getLogger(StartNewGameCommandHandler.class);
    private static final UUID SYSTEM_AGENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final EventStore eventStore;
    private final CharacterRepository characterRepository;
    private final EventPublisher eventPublisher;
    private final GamePersistenceService persistenceService;

    public StartNewGameCommandHandler(
        EventStore eventStore,
        CharacterRepository characterRepository,
        EventPublisher eventPublisher,
        GamePersistenceService persistenceService
    ) {
        this.eventStore = eventStore;
        this.characterRepository = characterRepository;
        this.eventPublisher = eventPublisher;
        this.persistenceService = persistenceService;
    }

    @Transactional
    public StartNewGameResponse handle(StartNewGameCommand command) {
        log.info("Handling StartNewGameCommand for agent {}", command.agentId());

        // Generate IDs
        InstanceId instanceId = InstanceId.generate();
        PartyId partyId = PartyId.generate();
        CharacterId characterId = CharacterId.random();

        // Create Instance aggregate
        Instance instance = Instance.create(instanceId, command.agentId(), SYSTEM_AGENT_ID);
        saveAggregate(instance, "Instance");

        // Create Party aggregate
        Party party = Party.create(partyId, instanceId, characterId, command.agentId());
        saveAggregate(party, "Party");

        // Create Character aggregate
        List<SkillId> skillFocusIds = command.skillFocuses().stream()
            .map(SkillId::of)
            .collect(Collectors.toList());

        Character character = Character.create(
            characterId,
            CharacterName.of(command.name()),
            command.origin(),
            command.attributes(),
            skillFocusIds,
            command.appearance(),
            true, // isProtagonist
            instanceId.value(),
            partyId.value(),
            command.agentId()
        );
        characterRepository.save(character);

        // Collect all events for publishing
        List<DomainEvent> allEvents = new ArrayList<>();
        allEvents.addAll(instance.getUncommittedEvents());
        allEvents.addAll(party.getUncommittedEvents());
        allEvents.addAll(character.getUncommittedEvents());

        // Publish events to Kafka
        eventPublisher.publish(allEvents);

        // Create save game record after events are committed
        try {
            persistenceService.saveGame(
                instanceId.value(),
                characterId.getValue(),
                command.name(),
                command.origin().toString()
            );
        } catch (Exception e) {
            log.error("Failed to create save game record for instance {}", instanceId, e);
            // Don't fail the entire operation if save creation fails
            // The game instance is still created successfully
        }

        log.info("Successfully created game instance {} with party {} and character {}", 
            instanceId, partyId, characterId);

        return new StartNewGameResponse(
            instanceId.value(),
            partyId.value(),
            characterId.getValue()
        );
    }

    private void saveAggregate(com.andara.domain.AggregateRoot aggregate, String aggregateType) {
        List<DomainEvent> events = aggregate.getUncommittedEvents();
        if (!events.isEmpty()) {
            eventStore.append(aggregate.getId(), aggregateType, events);
            aggregate.markCommitted();
        }
    }

    public record StartNewGameResponse(UUID instanceId, UUID partyId, UUID characterId) {}
}
