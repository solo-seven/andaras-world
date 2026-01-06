package com.andara.application.content;

import com.andara.content.ContentType;
import com.andara.domain.content.events.ContentReloaded;
import com.andara.infrastructure.EventPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Watches content directory for changes and automatically reloads content in development.
 * Only active in 'dev' and 'local' profiles.
 */
@Component
@Profile({"dev", "local"})
@ConditionalOnProperty(name = "content.hot-reload.enabled", havingValue = "true", matchIfMissing = true)
public class ContentFileWatcher {
    private static final Logger log = LoggerFactory.getLogger(ContentFileWatcher.class);
    
    private final ContentImportService importService;
    private final EventPublisher eventPublisher;
    private final ObjectMapper objectMapper;
    private final Path contentDir;
    private final long debounceMs;
    
    private WatchService watchService;
    private ExecutorService executorService;
    private volatile boolean running = false;

    public ContentFileWatcher(
        ContentImportService importService,
        EventPublisher eventPublisher,
        ObjectMapper objectMapper
    ) {
        this.importService = importService;
        this.eventPublisher = eventPublisher;
        this.objectMapper = objectMapper;
        // Default to ./content directory, can be configured via properties
        this.contentDir = Paths.get("./content");
        this.debounceMs = 500; // 500ms debounce
    }

    @PostConstruct
    public void startWatching() {
        if (!Files.exists(contentDir)) {
            log.warn("Content directory does not exist: {}. Hot-reload disabled.", contentDir);
            return;
        }
        
        try {
            watchService = FileSystems.getDefault().newWatchService();
            contentDir.register(
                watchService,
                StandardWatchEventKinds.ENTRY_MODIFY,
                StandardWatchEventKinds.ENTRY_CREATE
            );
            
            executorService = Executors.newSingleThreadExecutor(r -> {
                Thread t = new Thread(r, "content-file-watcher");
                t.setDaemon(true);
                return t;
            });
            
            running = true;
            executorService.submit(this::watchLoop);
            
            log.info("Content file watcher started for directory: {}", contentDir);
        } catch (IOException e) {
            log.error("Failed to start content file watcher", e);
        }
    }

    @PreDestroy
    public void stopWatching() {
        running = false;
        
        if (watchService != null) {
            try {
                watchService.close();
            } catch (IOException e) {
                log.error("Error closing watch service", e);
            }
        }
        
        if (executorService != null) {
            executorService.shutdown();
            try {
                if (!executorService.awaitTermination(5, TimeUnit.SECONDS)) {
                    executorService.shutdownNow();
                }
            } catch (InterruptedException e) {
                executorService.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
        
        log.info("Content file watcher stopped");
    }

    private void watchLoop() {
        while (running) {
            try {
                WatchKey key = watchService.take();
                
                for (WatchEvent<?> event : key.pollEvents()) {
                    if (event.kind() == StandardWatchEventKinds.OVERFLOW) {
                        continue;
                    }
                    
                    @SuppressWarnings("unchecked")
                    WatchEvent<Path> pathEvent = (WatchEvent<Path>) event;
                    Path changedFile = contentDir.resolve(pathEvent.context());
                    
                    log.debug("Content file changed: {}", changedFile);
                    
                    // Debounce: wait a bit for file write to complete
                    Thread.sleep(debounceMs);
                    
                    handleContentChange(changedFile);
                }
                
                boolean valid = key.reset();
                if (!valid) {
                    log.warn("Watch key no longer valid");
                    break;
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("Error in file watcher loop", e);
            }
        }
    }

    private void handleContentChange(Path file) {
        try {
            if (!Files.exists(file) || !Files.isRegularFile(file)) {
                return;
            }
            
            // Determine content type from file path
            ContentType contentType = detectContentType(file);
            if (contentType == null) {
                log.debug("Could not determine content type for: {}", file);
                return;
            }
            
            // Read and parse content
            String contentJson = Files.readString(file);
            Object contentData = objectMapper.readValue(contentJson, Object.class);
            
            // Import (this validates internally)
            var result = importService.importContent(
                contentType,
                List.of(contentData),
                "hot-reload",
                "Auto-reloaded from file: " + file.getFileName(),
                false
            );
            
            if (result.isSuccess()) {
                // Publish reload event
                ContentReloaded event = ContentReloaded.create(
                    contentType.name(),
                    result.getImportedIds(),
                    file.toString(),
                    null, // instanceId
                    null  // agentId
                );
                // Publish event and await completion to ensure it's sent before continuing
                try {
                    var future = eventPublisher.publish(List.of(event));
                    if (future != null) {
                        future.join();
                    }
                } catch (Exception e) {
                    log.error("Failed to publish ContentReloaded event", e);
                    // Continue execution - event publishing failure is logged but doesn't block hot-reload
                }
                
                log.info("Hot-reloaded content: {} from {}", contentType, file.getFileName());
            } else {
                log.warn("Hot-reload validation failed for {}: {}", file, result.getErrors());
            }
            
        } catch (Exception e) {
            log.error("Failed to hot-reload content from: {}", file, e);
        }
    }

    private ContentType detectContentType(Path file) {
        String fileName = file.getFileName().toString();
        String parentDir = file.getParent() != null ? file.getParent().getFileName().toString() : "";
        
        // Try to infer from directory structure
        return switch (parentDir) {
            case "items" -> ContentType.ITEM_TEMPLATE;
            case "skills" -> ContentType.SKILL_DEFINITION;
            case "abilities" -> ContentType.ABILITY_DEFINITION;
            case "recipes" -> ContentType.RECIPE;
            case "regions" -> ContentType.REGION_DEFINITION;
            case "zones" -> ContentType.ZONE_TEMPLATE;
            case "pois" -> ContentType.POI_TEMPLATE;
            case "npcs" -> ContentType.NPC_TEMPLATE;
            case "factions" -> ContentType.FACTION_DEFINITION;
            case "encounters" -> ContentType.ENCOUNTER_TEMPLATE;
            case "dialogue" -> ContentType.DIALOGUE_TREE;
            default -> {
                // Try to infer from schema filename pattern
                try {
                    String baseName = fileName.replace(".json", "");
                    yield ContentType.fromSchemaFileName(baseName + ".json");
                } catch (Exception e) {
                    yield null;
                }
            }
        };
    }
}
