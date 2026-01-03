package com.andara.domain.party;

import com.andara.common.ValueObject;

import java.util.Objects;

/**
 * Value object representing character appearance.
 * Minimal customization: gender and body type.
 */
public final class Appearance implements ValueObject {
    public enum Gender {
        MALE, FEMALE, NON_BINARY, OTHER
    }

    public enum BodyType {
        SLENDER, AVERAGE, STOCKY
    }

    private final Gender gender;
    private final BodyType bodyType;

    private Appearance(Gender gender, BodyType bodyType) {
        if (gender == null) {
            throw new IllegalArgumentException("Gender cannot be null");
        }
        if (bodyType == null) {
            throw new IllegalArgumentException("Body type cannot be null");
        }
        this.gender = gender;
        this.bodyType = bodyType;
    }

    public static Appearance create(Gender gender, BodyType bodyType) {
        return new Appearance(gender, bodyType);
    }

    public static Appearance defaultAppearance() {
        return new Appearance(Gender.NON_BINARY, BodyType.AVERAGE);
    }

    public Gender getGender() {
        return gender;
    }

    public BodyType getBodyType() {
        return bodyType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Appearance that = (Appearance) o;
        return gender == that.gender && bodyType == that.bodyType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(gender, bodyType);
    }
}

