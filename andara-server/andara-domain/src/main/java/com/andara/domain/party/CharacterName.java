package com.andara.domain.party;

import com.andara.common.ValueObject;

import java.util.Objects;

/**
 * Value object representing a character name with validation.
 */
public final class CharacterName implements ValueObject {
    private static final int MIN_LENGTH = 1;
    private static final int MAX_LENGTH = 50;

    private final String value;

    private CharacterName(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Character name cannot be null or blank");
        }
        String trimmed = value.trim();
        if (trimmed.length() < MIN_LENGTH || trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Character name must be between %d and %d characters, but got %d",
                    MIN_LENGTH, MAX_LENGTH, trimmed.length())
            );
        }
        this.value = trimmed;
    }

    public static CharacterName of(String value) {
        return new CharacterName(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CharacterName that = (CharacterName) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }
}

