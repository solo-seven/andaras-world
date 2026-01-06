package com.andara.domain;

import com.andara.common.ValueObject;

import java.util.Objects;

/**
 * Value object representing an aggregate type.
 */
public final class AggregateType implements ValueObject {
    private final String value;

    private AggregateType(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("AggregateType cannot be null or blank");
        }
        this.value = value;
    }

    public static AggregateType of(String value) {
        return new AggregateType(value);
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
        AggregateType that = (AggregateType) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
