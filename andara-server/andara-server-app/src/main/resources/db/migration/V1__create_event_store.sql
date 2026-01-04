-- Event Store Table
CREATE TABLE domain_events (
    event_id        UUID PRIMARY KEY,
    event_type      VARCHAR(255) NOT NULL,
    aggregate_id    VARCHAR(255) NOT NULL,
    aggregate_type  VARCHAR(100) NOT NULL,
    instance_id     UUID NOT NULL,
    agent_id        UUID NOT NULL,
    sequence_number BIGINT NOT NULL,
    timestamp       TIMESTAMP WITH TIME ZONE NOT NULL,
    payload         JSONB NOT NULL,
    metadata        JSONB,
    
    UNIQUE (aggregate_id, aggregate_type, sequence_number)
);

CREATE INDEX idx_events_aggregate ON domain_events(aggregate_id, aggregate_type);
CREATE INDEX idx_events_instance ON domain_events(instance_id);
CREATE INDEX idx_events_timestamp ON domain_events(timestamp);
CREATE INDEX idx_events_type ON domain_events(event_type);

-- Snapshot Table (Optimization)
CREATE TABLE aggregate_snapshots (
    aggregate_id    VARCHAR(255) NOT NULL,
    aggregate_type  VARCHAR(100) NOT NULL,
    sequence_number BIGINT NOT NULL,
    snapshot_data   JSONB NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    
    PRIMARY KEY (aggregate_id, aggregate_type)
);


