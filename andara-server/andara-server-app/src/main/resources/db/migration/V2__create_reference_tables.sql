-- Instances table
CREATE TABLE instances (
    instance_id     UUID PRIMARY KEY,
    owner_agent_id  UUID NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    status          VARCHAR(50) NOT NULL
);

-- Saves table
CREATE TABLE saves (
    save_id         UUID PRIMARY KEY,
    instance_id     UUID NOT NULL REFERENCES instances(instance_id),
    name            VARCHAR(255) NOT NULL,
    last_event_id   UUID NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata        JSONB NOT NULL
);


