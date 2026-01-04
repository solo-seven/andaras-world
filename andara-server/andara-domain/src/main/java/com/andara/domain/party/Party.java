package com.andara.domain.party;

import com.andara.domain.AggregateRoot;
import com.andara.domain.DomainEvent;
import com.andara.domain.game.InstanceId;
import com.andara.domain.party.events.PartyCreated;

import java.util.List;
import java.util.UUID;

/**
 * Party aggregate root.
 * Represents a group of characters controlled by a player.
 */
public class Party extends AggregateRoot {
    private PartyId partyId;
    private InstanceId instanceId;
    private CharacterId protagonistId;

    private Party() {
    }

    /**
     * Create a new party with a protagonist.
     */
    public static Party create(
        PartyId partyId,
        InstanceId instanceId,
        CharacterId protagonistId,
        UUID agentId
    ) {
        Party party = new Party();
        party.partyId = partyId;
        party.id = partyId.toString();
        party.instanceId = instanceId;
        party.protagonistId = protagonistId;

        PartyCreated event = PartyCreated.create(
            partyId,
            instanceId,
            protagonistId,
            agentId
        );

        party.applyEvent(event);
        return party;
    }

    /**
     * Reconstitute party from events.
     */
    public static Party fromEvents(List<DomainEvent> events) {
        Party party = new Party();
        for (DomainEvent event : events) {
            party.when(event);
        }
        return party;
    }

    @Override
    protected void when(DomainEvent event) {
        if (event instanceof PartyCreated e) {
            handlePartyCreated(e);
        }
    }

    private void handlePartyCreated(PartyCreated event) {
        this.partyId = PartyId.from((String) event.getPayload().get("partyId"));
        this.id = partyId.toString();
        this.instanceId = InstanceId.from((String) event.getPayload().get("instanceId"));
        this.protagonistId = CharacterId.from((String) event.getPayload().get("protagonistId"));
    }

    public PartyId getPartyId() {
        return partyId;
    }

    public InstanceId getInstanceId() {
        return instanceId;
    }

    public CharacterId getProtagonistId() {
        return protagonistId;
    }
}
