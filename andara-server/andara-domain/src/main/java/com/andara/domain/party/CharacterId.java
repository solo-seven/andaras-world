package com.andara.domain.party;

import com.andara.common.ValueObject;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a unique character identifier.
 */
public final class CharacterId implements ValueObject {
    private final UUID value;

    private CharacterId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("CharacterId cannot be null");
        }
        this.value = value;
    }

    public static CharacterId random() {
        return new CharacterId(UUID.randomUUID());
    }

    public static CharacterId from(String value) {
        return new CharacterId(UUID.fromString(value));
    }

    public static CharacterId from(UUID value) {
        return new CharacterId(value);
    }

    public UUID getValue() {
        return value;
    }

    public String toString() {
        return value.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CharacterId that = (CharacterId) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}

