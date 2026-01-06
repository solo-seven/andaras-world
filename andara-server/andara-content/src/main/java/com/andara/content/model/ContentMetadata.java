package com.andara.content.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Map;

/**
 * Metadata associated with content versions (author, version, timestamps, etc.)
 */
public class ContentMetadata {
    private final String version;
    private final String author;
    private final String description;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final Map<String, String> tags;
    private final Map<String, Object> additionalProperties;

    @JsonCreator
    public ContentMetadata(
        @JsonProperty("version") String version,
        @JsonProperty("author") String author,
        @JsonProperty("description") String description,
        @JsonProperty("createdAt") Instant createdAt,
        @JsonProperty("updatedAt") Instant updatedAt,
        @JsonProperty("tags") Map<String, String> tags,
        @JsonProperty("additionalProperties") Map<String, Object> additionalProperties
    ) {
        this.version = version;
        this.author = author;
        this.description = description;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
        this.tags = tags;
        this.additionalProperties = additionalProperties;
    }

    public ContentMetadata(String version, String author, String description) {
        this(version, author, description, Instant.now(), Instant.now(), null, null);
    }

    public String getVersion() {
        return version;
    }

    public String getAuthor() {
        return author;
    }

    public String getDescription() {
        return description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Map<String, String> getTags() {
        return tags;
    }

    public Map<String, Object> getAdditionalProperties() {
        return additionalProperties;
    }
}
