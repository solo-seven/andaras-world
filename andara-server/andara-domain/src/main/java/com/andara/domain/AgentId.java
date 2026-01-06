package com.andara.domain;

import com.andara.common.ValueObject;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing an agent identifier.
 */
public final class AgentId implements ValueObject {
    private final UUID value;

    private AgentId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("AgentId cannot be null");
        }
        this.value = value;
    }

    public static AgentId random() {
        return new AgentId(UUID.randomUUID());
    }

    public static AgentId from(String value) {
        return new AgentId(UUID.fromString(value));
    }

    public static AgentId from(UUID value) {
        return new AgentId(value);
    }

    public UUID getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AgentId agentId = (AgentId) o;
        return Objects.equals(value, agentId.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
