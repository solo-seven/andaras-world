package com.andara.application.content;

import com.andara.content.ContentType;
import com.andara.content.model.ContentVersion;
import com.andara.content.model.ExportResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for exporting content from database to JSON files.
 */
@Service
public class ContentExportService {
    private static final Logger log = LoggerFactory.getLogger(ContentExportService.class);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    
    private final ContentRepositoryService repositoryService;
    private final ObjectMapper objectMapper;

    public ContentExportService(
        ContentRepositoryService repositoryService,
        ObjectMapper objectMapper
    ) {
        this.repositoryService = repositoryService;
        this.objectMapper = objectMapper;
    }

    public ExportResult exportContent(
        ContentType contentType,
        Path outputDirectory,
        String exportedBy,
        String environment
    ) {
        log.info("Exporting {} content to {}", contentType, outputDirectory);
        
        try {
            // Ensure output directory exists
            Files.createDirectories(outputDirectory);
            
            // Get all active content
            List<ContentVersion> versions = repositoryService.findAllActive(contentType);
            log.info("Found {} active {} items", versions.size(), contentType);
            
            Map<String, List<ExportResult.ExportedFile>> filesByType = new HashMap<>();
            List<String> errors = new ArrayList<>();
            
            List<ExportResult.ExportedFile> exportedFiles = new ArrayList<>();
            
            for (ContentVersion version : versions) {
                try {
                    ExportResult.ExportedFile file = exportSingleContent(
                        version,
                        contentType,
                        outputDirectory
                    );
                    exportedFiles.add(file);
                } catch (Exception e) {
                    String error = String.format("Failed to export %s: %s", version.getContentId(), e.getMessage());
                    errors.add(error);
                    log.error(error, e);
                }
            }
            
            filesByType.put(contentType.name(), exportedFiles);
            
            // Generate manifest
            String manifestPath = generateManifest(
                contentType,
                outputDirectory,
                exportedFiles,
                exportedBy,
                environment
            );
            
            log.info("Export complete: {} files exported to {}", exportedFiles.size(), outputDirectory);
            
            return new ExportResult(
                exportedFiles.size(),
                outputDirectory.toString(),
                manifestPath,
                filesByType,
                errors.isEmpty() ? null : errors
            );
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to create output directory", e);
        }
    }

    private ExportResult.ExportedFile exportSingleContent(
        ContentVersion version,
        ContentType contentType,
        Path outputDirectory
    ) throws IOException {
        // Determine file path based on content type
        Path filePath = determineFilePath(contentType, version.getContentId(), outputDirectory);
        
        // Ensure parent directory exists
        Files.createDirectories(filePath.getParent());
        
        // Serialize content
        String json = objectMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(version.getContentData());
        
        // Write file
        Files.writeString(filePath, json);
        
        // Calculate checksum
        String checksum = calculateChecksum(json);
        long fileSize = Files.size(filePath);
        
        log.debug("Exported {} to {}", version.getContentId(), filePath);
        
        return new ExportResult.ExportedFile(
            version.getContentId(),
            outputDirectory.relativize(filePath).toString(),
            checksum,
            fileSize
        );
    }

    private Path determineFilePath(ContentType contentType, String contentId, Path outputDirectory) {
        // Organize files by subdirectory based on content type
        String subDir = switch (contentType) {
            case ITEM_TEMPLATE -> "items";
            case SKILL_DEFINITION -> "skills";
            case ABILITY_DEFINITION -> "abilities";
            case RECIPE -> "recipes";
            case REGION_DEFINITION -> "regions";
            case ZONE_TEMPLATE -> "zones";
            case POI_TEMPLATE -> "pois";
            case NPC_TEMPLATE -> "npcs";
            case FACTION_DEFINITION -> "factions";
            case ENCOUNTER_TEMPLATE -> "encounters";
            case DIALOGUE_TREE -> "dialogue";
        };
        
        // Create filename from content ID (sanitize)
        String fileName = contentId.replaceAll("[^a-zA-Z0-9_-]", "_") + ".json";
        
        return outputDirectory.resolve(subDir).resolve(fileName);
    }

    private String generateManifest(
        ContentType contentType,
        Path outputDirectory,
        List<ExportResult.ExportedFile> files,
        String exportedBy,
        String environment
    ) throws IOException {
        Map<String, Object> manifest = new LinkedHashMap<>();
        manifest.put("version", "0.1.0");
        manifest.put("exportedAt", ISO_FORMATTER.format(Instant.now()));
        manifest.put("exportedBy", exportedBy);
        manifest.put("environment", environment);
        manifest.put("contentType", contentType.name());
        
        Map<String, Object> contents = new LinkedHashMap<>();
        contents.put("count", files.size());
        
        List<Map<String, Object>> fileList = files.stream()
            .map(file -> {
                Map<String, Object> fileInfo = new LinkedHashMap<>();
                fileInfo.put("id", file.getId());
                fileInfo.put("path", file.getPath());
                fileInfo.put("checksum", file.getChecksum());
                fileInfo.put("fileSize", file.getFileSize());
                return fileInfo;
            })
            .collect(Collectors.toList());
        contents.put("files", fileList);
        
        manifest.put("contents", contents);
        
        Path manifestPath = outputDirectory.resolve("manifest.json");
        String manifestJson = objectMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(manifest);
        Files.writeString(manifestPath, manifestJson);
        
        return outputDirectory.relativize(manifestPath).toString();
    }

    private String calculateChecksum(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes());
            return "sha256:" + bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
