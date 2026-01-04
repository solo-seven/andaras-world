package com.andara.domain.game;

import java.util.UUID;

/**
 * Value object representing an instance identifier.
 */
public record InstanceId(UUID value) {
    public static InstanceId generate() {
        return new InstanceId(UUID.randomUUID());
    }

    public static InstanceId from(UUID uuid) {
        return new InstanceId(uuid);
    }

    public static InstanceId from(String uuidString) {
        return new InstanceId(UUID.fromString(uuidString));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
