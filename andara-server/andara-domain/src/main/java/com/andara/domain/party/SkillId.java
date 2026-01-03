package com.andara.domain.party;

import com.andara.common.ValueObject;

import java.util.Objects;

/**
 * Value object representing a skill identifier.
 */
public final class SkillId implements ValueObject {
    private final String value;

    private SkillId(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("SkillId cannot be null or blank");
        }
        this.value = value;
    }

    public static SkillId of(String value) {
        return new SkillId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SkillId skillId = (SkillId) o;
        return Objects.equals(value, skillId.value);
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

