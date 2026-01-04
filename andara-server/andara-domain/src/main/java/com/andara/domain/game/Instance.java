package com.andara.domain.game;

import com.andara.domain.AggregateRoot;
import com.andara.domain.DomainEvent;
import com.andara.domain.game.events.InstanceCreated;

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
     * Reconstitute instance from events.
     */
    public static Instance fromEvents(List<DomainEvent> events) {
        Instance instance = new Instance();
        for (DomainEvent event : events) {
            instance.when(event);
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
}
