package com.andara.infrastructure.party;

import com.andara.infrastructure.CharacterRepository;
import com.andara.domain.DomainEvent;
import com.andara.domain.party.Character;
import com.andara.domain.party.CharacterId;
import com.andara.infrastructure.eventstore.EventStore;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Event-sourced repository implementation for Character aggregate.
 */
@Repository
public class EventSourcedCharacterRepository implements CharacterRepository {

    private final EventStore eventStore;

    public EventSourcedCharacterRepository(EventStore eventStore) {
        this.eventStore = eventStore;
    }

    @Override
    public void save(Character character) {
        List<DomainEvent> events = character.getUncommittedEvents();
        if (!events.isEmpty()) {
            eventStore.append(character.getId(), "Character", events);
            character.markCommitted();
        }
    }

    @Override
    public Character load(CharacterId characterId) {
        List<DomainEvent> events = eventStore.getEvents(characterId.toString(), "Character");
        if (events.isEmpty()) {
            throw new IllegalArgumentException("Character not found: " + characterId);
        }
        return Character.fromEvents(events);
    }

    @Override
    public boolean exists(CharacterId characterId) {
        return eventStore.hasEvents(characterId.toString(), "Character");
    }
}

