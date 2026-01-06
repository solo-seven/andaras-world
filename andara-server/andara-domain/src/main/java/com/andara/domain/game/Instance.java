package com.andara.domain.game;

import com.andara.domain.AggregateRoot;
import com.andara.domain.DomainEvent;
import com.andara.domain.game.events.InstanceCreated;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.List;
import java.util.UUID;

/**
 * Instance aggregate root.
 * Represents a game instance/playthrough.
 */
public class Instance extends AggregateRoot {
    private InstanceId instanceId;
    private UUID ownerAgentId;

    private Instance() {
    }

    /**
     * Create a new game instance.
     */
    public static Instance create(
        InstanceId instanceId,
        UUID ownerAgentId,
        UUID systemAgentId
    ) {
        Instance instance = new Instance();
        instance.instanceId = instanceId;
        instance.id = instanceId.toString();
        instance.ownerAgentId = ownerAgentId;

        InstanceCreated event = InstanceCreated.create(
            instanceId,
            ownerAgentId,
            systemAgentId
        );

        instance.applyEvent(event);
        return instance;
    }

    /**
     * Create an empty instance for event replay.
     */
    public static Instance empty(InstanceId instanceId) {
        Instance instance = new Instance();
        instance.instanceId = instanceId;
        instance.id = instanceId.toString();
        return instance;
    }

    /**
     * Reconstitute instance from events.
     */
    public static Instance fromEvents(List<DomainEvent> events) {
        if (events.isEmpty()) {
            throw new IllegalArgumentException("Cannot create instance from empty event list");
        }
        
        // Extract instance ID from first event
        String instanceIdStr = events.get(0).getAggregateId();
        InstanceId instanceId = InstanceId.from(instanceIdStr);
        Instance instance = empty(instanceId);
        
        // Apply all events as historical events
        for (DomainEvent event : events) {
            instance.applyHistoricalEvent(event);
        }
        
        return instance;
    }

    @Override
    protected void when(DomainEvent event) {
        if (event instanceof InstanceCreated e) {
            handleInstanceCreated(e);
        }
    }

    private void handleInstanceCreated(InstanceCreated event) {
        this.instanceId = InstanceId.from((String) event.getPayload().get("instanceId"));
        this.id = instanceId.toString();
        this.ownerAgentId = UUID.fromString((String) event.getPayload().get("ownerAgentId"));
    }

    public InstanceId getInstanceId() {
        return instanceId;
    }

    public UUID getOwnerAgentId() {
        return ownerAgentId;
    }

    @Override
    public JsonNode toSnapshot() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode snapshot = mapper.createObjectNode();
        snapshot.put("instanceId", instanceId != null ? instanceId.value().toString() : null);
        snapshot.put("ownerAgentId", ownerAgentId != null ? ownerAgentId.toString() : null);
        snapshot.put("version", version);
        return snapshot;
    }

    @Override
    public void fromSnapshot(JsonNode snapshot) {
        if (snapshot.has("instanceId") && !snapshot.get("instanceId").isNull()) {
            this.instanceId = InstanceId.from(snapshot.get("instanceId").asText());
            this.id = instanceId.toString();
        }
        if (snapshot.has("ownerAgentId") && !snapshot.get("ownerAgentId").isNull()) {
            this.ownerAgentId = UUID.fromString(snapshot.get("ownerAgentId").asText());
        }
        if (snapshot.has("version")) {
            this.version = snapshot.get("version").asLong();
        }
    }
}
