package com.andara.domain.party;

import com.andara.domain.AggregateRoot;
import com.andara.domain.DomainEvent;
import com.andara.domain.game.InstanceId;
import com.andara.domain.party.events.PartyCreated;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

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
     * Create an empty party for event replay.
     */
    public static Party empty(PartyId partyId) {
        Party party = new Party();
        party.partyId = partyId;
        party.id = partyId.toString();
        return party;
    }

    /**
     * Reconstitute party from events.
     */
    public static Party fromEvents(List<DomainEvent> events) {
        if (events.isEmpty()) {
            throw new IllegalArgumentException("Cannot create party from empty event list");
        }
        
        // Extract party ID from first event
        String partyIdStr = events.get(0).getAggregateId();
        PartyId partyId = PartyId.from(partyIdStr);
        Party party = empty(partyId);
        
        // Apply all events as historical events
        for (DomainEvent event : events) {
            party.applyHistoricalEvent(event);
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

    @Override
    public JsonNode toSnapshot() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode snapshot = mapper.createObjectNode();
        snapshot.put("partyId", partyId != null ? partyId.value().toString() : null);
        snapshot.put("instanceId", instanceId != null ? instanceId.value().toString() : null);
        snapshot.put("protagonistId", protagonistId != null ? protagonistId.toString() : null);
        snapshot.put("version", version);
        return snapshot;
    }

    @Override
    public void fromSnapshot(JsonNode snapshot) {
        if (snapshot.has("partyId") && !snapshot.get("partyId").isNull()) {
            this.partyId = PartyId.from(snapshot.get("partyId").asText());
            this.id = partyId.toString();
        }
        if (snapshot.has("instanceId") && !snapshot.get("instanceId").isNull()) {
            this.instanceId = InstanceId.from(snapshot.get("instanceId").asText());
        }
        if (snapshot.has("protagonistId") && !snapshot.get("protagonistId").isNull()) {
            this.protagonistId = CharacterId.from(snapshot.get("protagonistId").asText());
        }
        if (snapshot.has("version")) {
            this.version = snapshot.get("version").asLong();
        }
    }
}
