package com.andara.application.content;

import com.andara.content.ContentType;
import com.andara.content.model.ImportResult;
import com.andara.content.validation.ValidationEngine;
import com.andara.content.validation.ValidationResult;
import com.andara.domain.content.events.ContentImported;
import com.andara.infrastructure.EventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for importing content with validation and event publishing.
 */
@Service
public class ContentImportService {
    private static final Logger log = LoggerFactory.getLogger(ContentImportService.class);
    
    private final ValidationEngine validationEngine;
    private final ContentRepositoryService repositoryService;
    private final EventPublisher eventPublisher;

    public ContentImportService(
        ValidationEngine validationEngine,
        ContentRepositoryService repositoryService,
        EventPublisher eventPublisher
    ) {
        this.validationEngine = validationEngine;
        this.repositoryService = repositoryService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ImportResult importContent(
        ContentType contentType,
        List<Object> contentItems,
        String importedBy,
        String changeSummary,
        boolean dryRun
    ) {
        log.info("Importing {} {} items (dryRun={})", contentItems.size(), contentType, dryRun);
        
        List<String> importedIds = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        // Validate all items first
        ValidationResult validation = validationEngine.validateBatch(contentType, contentItems);
        if (!validation.isValid()) {
            log.warn("Validation failed for {} items", validation.getErrors().size());
            return ImportResult.failure(validation.getErrors());
        }
        
        warnings.addAll(validation.getWarnings());
        
        if (dryRun) {
            log.info("Dry run: Validation passed, but not importing");
            return ImportResult.dryRun(validation);
        }
        
        // Import each item
        for (Object content : contentItems) {
            try {
                String contentId = repositoryService.extractContentId(contentType, content);
                
                // Save version
                repositoryService.saveVersion(
                    contentType,
                    contentId,
                    content,
                    importedBy,
                    changeSummary
                );
                
                importedIds.add(contentId);
                log.debug("Imported {}: {}", contentType, contentId);
                
            } catch (Exception e) {
                String errorMsg = String.format("Failed to import content: %s", e.getMessage());
                errors.add(errorMsg);
                log.error(errorMsg, e);
            }
        }
        
        // Publish event if successful
        if (errors.isEmpty() && !importedIds.isEmpty()) {
            ContentImported event = ContentImported.create(
                contentType.name(),
                importedIds,
                importedBy,
                null, // instanceId - system operation
                null  // agentId - system operation
            );
            // Publish event and await completion to ensure it's sent
            try {
                var future = eventPublisher.publish(List.of(event));
                if (future != null) {
                    future.join();
                }
            } catch (Exception e) {
                log.error("Failed to publish ContentImported event", e);
                // Continue execution - event publishing failure is logged but doesn't block import
            }
            log.info("Published ContentImported event for {} items", importedIds.size());
        }
        
        if (errors.isEmpty()) {
            return warnings.isEmpty() 
                ? ImportResult.success(importedIds)
                : ImportResult.withWarnings(importedIds, warnings);
        } else {
            return ImportResult.partial(importedIds, errors);
        }
    }
}
