package com.andara.domain.party;

import com.andara.common.ValueObject;

import java.util.Objects;

/**
 * Value object representing skill proficiency level.
 * Proficiency ranges from 0 to 100.
 */
public final class Proficiency implements ValueObject {
    private static final int MIN_PROFICIENCY = 0;
    private static final int MAX_PROFICIENCY = 100;

    private final int level;

    private Proficiency(int level) {
        if (level < MIN_PROFICIENCY || level > MAX_PROFICIENCY) {
            throw new IllegalArgumentException(
                String.format("Proficiency must be between %d and %d, but got %d", MIN_PROFICIENCY, MAX_PROFICIENCY, level)
            );
        }
        this.level = level;
    }

    public static Proficiency of(int level) {
        return new Proficiency(level);
    }

    public static Proficiency zero() {
        return new Proficiency(0);
    }

    public int getLevel() {
        return level;
    }

    public Proficiency increase(int amount) {
        return new Proficiency(Math.min(MAX_PROFICIENCY, level + amount));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Proficiency that = (Proficiency) o;
        return level == that.level;
    }

    @Override
    public int hashCode() {
        return Objects.hash(level);
    }

    @Override
    public String toString() {
        return String.valueOf(level);
    }
}

