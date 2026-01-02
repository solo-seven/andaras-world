package com.andara.domain.party;

import com.andara.common.ValueObject;

import java.util.Objects;

/**
 * Value object representing character attributes.
 * Attributes range from 6-16, and total points must equal 27.
 */
public final class Attributes implements ValueObject {
    private static final int MIN_ATTRIBUTE = 6;
    private static final int MAX_ATTRIBUTE = 16;
    private static final int BASE_ATTRIBUTE = 8;
    private static final int POINTS_TO_DISTRIBUTE = 27;

    private final int strength;
    private final int agility;
    private final int endurance;
    private final int intellect;
    private final int perception;
    private final int charisma;

    private Attributes(int strength, int agility, int endurance, int intellect, int perception, int charisma) {
        validateAttribute(strength, "Strength");
        validateAttribute(agility, "Agility");
        validateAttribute(endurance, "Endurance");
        validateAttribute(intellect, "Intellect");
        validateAttribute(perception, "Perception");
        validateAttribute(charisma, "Charisma");

        int total = strength + agility + endurance + intellect + perception + charisma;
        
        // Point-buy validation: calculate points used from base (8 each)
        // Points used = sum of (attr - BASE_ATTRIBUTE) for all attributes
        // This can be negative if attributes are reduced below 8 (points recovered)
        int pointsUsed = (strength - BASE_ATTRIBUTE) +
                        (agility - BASE_ATTRIBUTE) +
                        (endurance - BASE_ATTRIBUTE) +
                        (intellect - BASE_ATTRIBUTE) +
                        (perception - BASE_ATTRIBUTE) +
                        (charisma - BASE_ATTRIBUTE);
        
        // Validate: points used cannot exceed available points to distribute
        // Can be negative (attributes reduced below base), allowing more points for other attributes
        if (pointsUsed > POINTS_TO_DISTRIBUTE) {
            throw new IllegalArgumentException(
                String.format("Attribute distribution uses %d points, but only %d are available",
                    pointsUsed, POINTS_TO_DISTRIBUTE)
            );
        }
        
        // Also validate total is within absolute bounds (all 6s to all 16s)
        int minTotal = MIN_ATTRIBUTE * 6; // 36
        int maxTotal = MAX_ATTRIBUTE * 6; // 96
        if (total < minTotal || total > maxTotal) {
            throw new IllegalArgumentException(
                String.format("Total attribute points must be between %d and %d, but got %d",
                    minTotal, maxTotal, total)
            );
        }

        this.strength = strength;
        this.agility = agility;
        this.endurance = endurance;
        this.intellect = intellect;
        this.perception = perception;
        this.charisma = charisma;
    }

    public static Attributes create(int strength, int agility, int endurance, int intellect, int perception, int charisma) {
        return new Attributes(strength, agility, endurance, intellect, perception, charisma);
    }

    public static Attributes defaultAttributes() {
        return new Attributes(BASE_ATTRIBUTE, BASE_ATTRIBUTE, BASE_ATTRIBUTE, BASE_ATTRIBUTE, BASE_ATTRIBUTE, BASE_ATTRIBUTE);
    }

    private static void validateAttribute(int value, String name) {
        if (value < MIN_ATTRIBUTE || value > MAX_ATTRIBUTE) {
            throw new IllegalArgumentException(
                String.format("%s must be between %d and %d, but got %d", name, MIN_ATTRIBUTE, MAX_ATTRIBUTE, value)
            );
        }
    }

    public int strength() {
        return strength;
    }

    public int agility() {
        return agility;
    }

    public int endurance() {
        return endurance;
    }

    public int intellect() {
        return intellect;
    }

    public int perception() {
        return perception;
    }

    public int charisma() {
        return charisma;
    }

    public int total() {
        return strength + agility + endurance + intellect + perception + charisma;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Attributes that = (Attributes) o;
        return strength == that.strength &&
            agility == that.agility &&
            endurance == that.endurance &&
            intellect == that.intellect &&
            perception == that.perception &&
            charisma == that.charisma;
    }

    @Override
    public int hashCode() {
        return Objects.hash(strength, agility, endurance, intellect, perception, charisma);
    }

    @Override
    public String toString() {
        return String.format("Attributes{STR=%d, AGI=%d, END=%d, INT=%d, PER=%d, CHA=%d}",
            strength, agility, endurance, intellect, perception, charisma);
    }
}

