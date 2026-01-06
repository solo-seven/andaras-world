package com.andara.content.model;

import java.util.List;
import java.util.Map;

/**
 * Result of a content export operation.
 */
public class ExportResult {
    private final int exportedCount;
    private final String outputDirectory;
    private final String manifestPath;
    private final Map<String, List<ExportedFile>> filesByType;
    private final List<String> errors;

    public ExportResult(
        int exportedCount,
        String outputDirectory,
        String manifestPath,
        Map<String, List<ExportedFile>> filesByType,
        List<String> errors
    ) {
        this.exportedCount = exportedCount;
        this.outputDirectory = outputDirectory;
        this.manifestPath = manifestPath;
        this.filesByType = filesByType;
        this.errors = errors;
    }

    public int getExportedCount() {
        return exportedCount;
    }

    public String getOutputDirectory() {
        return outputDirectory;
    }

    public String getManifestPath() {
        return manifestPath;
    }

    public Map<String, List<ExportedFile>> getFilesByType() {
        return filesByType;
    }

    public List<String> getErrors() {
        return errors;
    }

    /**
     * Represents a single exported file with its metadata.
     */
    public static class ExportedFile {
        private final String id;
        private final String path;
        private final String checksum;
        private final long fileSize;

        public ExportedFile(String id, String path, String checksum, long fileSize) {
            this.id = id;
            this.path = path;
            this.checksum = checksum;
            this.fileSize = fileSize;
        }

        public String getId() {
            return id;
        }

        public String getPath() {
            return path;
        }

        public String getChecksum() {
            return checksum;
        }

        public long getFileSize() {
            return fileSize;
        }
    }
}
