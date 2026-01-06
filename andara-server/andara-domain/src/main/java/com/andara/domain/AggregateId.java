package com.andara.domain;

import com.andara.common.ValueObject;

import java.util.Objects;

/**
 * Value object representing an aggregate identifier.
 */
public final class AggregateId implements ValueObject {
    private final String value;

    private AggregateId(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("AggregateId cannot be null or blank");
        }
        this.value = value;
    }

    public static AggregateId of(String value) {
        return new AggregateId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AggregateId that = (AggregateId) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
