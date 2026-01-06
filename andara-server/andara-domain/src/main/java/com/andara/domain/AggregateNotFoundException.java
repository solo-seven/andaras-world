package com.andara.domain;

/**
 * Exception thrown when an aggregate is not found in the event store.
 */
public class AggregateNotFoundException extends RuntimeException {
    private final String aggregateId;
    private final String aggregateType;

    public AggregateNotFoundException(String aggregateId, String aggregateType) {
        super(String.format("Aggregate not found: %s/%s", aggregateType, aggregateId));
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
    }

    public AggregateNotFoundException(AggregateId aggregateId, AggregateType aggregateType) {
        this(aggregateId.getValue(), aggregateType.getValue());
    }

    public String getAggregateId() {
        return aggregateId;
    }

    public String getAggregateType() {
        return aggregateType;
    }
}
