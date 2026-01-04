-- Read Model Tables for Projections

-- Instance Read Model (simplified for now)
CREATE TABLE IF NOT EXISTS instances (
    instance_id     UUID PRIMARY KEY,
    owner_agent_id  UUID NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(50) NOT NULL DEFAULT 'active'
);

-- Party Read Model
CREATE TABLE IF NOT EXISTS party_view (
    party_id        UUID PRIMARY KEY,
    instance_id     UUID NOT NULL REFERENCES instances(instance_id),
    position_region VARCHAR(255),
    position_zone   VARCHAR(255),
    member_count    INT NOT NULL DEFAULT 1,
    total_credits   BIGINT NOT NULL DEFAULT 0,
    formation       VARCHAR(50),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data            JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_party_view_instance ON party_view(instance_id);

-- Character Read Model
CREATE TABLE IF NOT EXISTS character_view (
    character_id    UUID PRIMARY KEY,
    party_id        UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    origin          VARCHAR(50) NOT NULL,
    is_protagonist  BOOLEAN NOT NULL DEFAULT false,
    health_current  INT NOT NULL DEFAULT 100,
    health_max      INT NOT NULL DEFAULT 100,
    status          VARCHAR(50) NOT NULL DEFAULT 'active',
    attributes      JSONB NOT NULL,
    skills          JSONB NOT NULL,
    appearance      JSONB,
    equipment       JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_character_view_party ON character_view(party_id);

