package com.andara.application.content;

import com.andara.content.ContentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Service that seeds baseline content on application startup.
 * Only runs if content.seed.enabled=true and content.seed.on-startup=true
 */
@Component
@ConditionalOnProperty(name = "content.seed.on-startup", havingValue = "true", matchIfMissing = false)
@Order(100) // Run after database migrations
public class ContentSeedService implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(ContentSeedService.class);
    
    private final ContentImportService importService;

    public ContentSeedService(ContentImportService importService) {
        this.importService = importService;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting content seeding...");
        
        Path seedDir = Paths.get("./content/seed");
        if (!Files.exists(seedDir)) {
            log.warn("Seed content directory not found: {}. Skipping seeding.", seedDir);
            return;
        }
        
        // TODO: Implement actual seed content loading
        // For now, this is a placeholder that can be expanded
        log.info("Content seeding completed (placeholder implementation)");
        log.info("To seed content, place files in: {}", seedDir);
    }
}
