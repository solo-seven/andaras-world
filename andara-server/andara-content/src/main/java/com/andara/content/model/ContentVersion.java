package com.andara.content.model;

import com.andara.content.ContentType;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents a versioned piece of content with its metadata and data.
 */
public class ContentVersion {
    private final UUID versionId;
    private final ContentType contentType;
    private final String contentId;
    private final int versionNumber;
    private final Object contentData;
    private final ContentMetadata metadata;
    private final Instant importedAt;
    private final String importedBy;
    private final String changeSummary;

    @JsonCreator
    public ContentVersion(
        @JsonProperty("versionId") UUID versionId,
        @JsonProperty("contentType") ContentType contentType,
        @JsonProperty("contentId") String contentId,
        @JsonProperty("versionNumber") int versionNumber,
        @JsonProperty("contentData") Object contentData,
        @JsonProperty("metadata") ContentMetadata metadata,
        @JsonProperty("importedAt") Instant importedAt,
        @JsonProperty("importedBy") String importedBy,
        @JsonProperty("changeSummary") String changeSummary
    ) {
        this.versionId = versionId != null ? versionId : UUID.randomUUID();
        this.contentType = contentType;
        this.contentId = contentId;
        this.versionNumber = versionNumber;
        this.contentData = contentData;
        this.metadata = metadata;
        this.importedAt = importedAt != null ? importedAt : Instant.now();
        this.importedBy = importedBy;
        this.changeSummary = changeSummary;
    }

    public UUID getVersionId() {
        return versionId;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public String getContentId() {
        return contentId;
    }

    public int getVersionNumber() {
        return versionNumber;
    }

    public Object getContentData() {
        return contentData;
    }

    public ContentMetadata getMetadata() {
        return metadata;
    }

    public Instant getImportedAt() {
        return importedAt;
    }

    public String getImportedBy() {
        return importedBy;
    }

    public String getChangeSummary() {
        return changeSummary;
    }
}
