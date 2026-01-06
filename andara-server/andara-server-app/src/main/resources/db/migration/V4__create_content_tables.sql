-- Content Management System Tables
-- Version history and active content tracking

-- Content versioning and audit trail
CREATE TABLE content_versions (
    version_id      UUID PRIMARY KEY,
    content_type    VARCHAR(100) NOT NULL,
    content_id      VARCHAR(255) NOT NULL,
    version_number  INT NOT NULL,
    content_data    JSONB NOT NULL,
    imported_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    imported_by     VARCHAR(255) NOT NULL,
    change_summary  TEXT,
    
    UNIQUE (content_type, content_id, version_number)
);

CREATE INDEX idx_content_versions_type ON content_versions(content_type);
CREATE INDEX idx_content_versions_id ON content_versions(content_id);
CREATE INDEX idx_content_versions_imported_at ON content_versions(imported_at);

-- Current active content (fast lookup)
CREATE TABLE active_content (
    content_type    VARCHAR(100) NOT NULL,
    content_id      VARCHAR(255) NOT NULL,
    version_id      UUID NOT NULL REFERENCES content_versions(version_id) ON DELETE CASCADE,
    activated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (content_type, content_id)
);

CREATE INDEX idx_active_content_type ON active_content(content_type);
CREATE INDEX idx_active_content_version ON active_content(version_id);
