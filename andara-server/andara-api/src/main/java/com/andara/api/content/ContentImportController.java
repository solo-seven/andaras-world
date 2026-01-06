package com.andara.api.content;

import com.andara.application.content.ContentImportService;
import com.andara.content.ContentType;
import com.andara.content.model.ImportResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for content import operations.
 * TODO: Add @PreAuthorize("hasRole('ADMIN')") when authentication is implemented
 */
@RestController
@RequestMapping("/api/admin/content")
public class ContentImportController {
    private static final Logger log = LoggerFactory.getLogger(ContentImportController.class);
    
    private final ContentImportService importService;
    private final ObjectMapper objectMapper;

    public ContentImportController(
        ContentImportService importService,
        ObjectMapper objectMapper
    ) {
        this.importService = importService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/import")
    // TODO: @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> importContent(
        @RequestParam("type") String contentTypeStr,
        @RequestParam(value = "dryRun", defaultValue = "false") boolean dryRun,
        @RequestBody Map<String, Object> requestBody
    ) {
        try {
            ContentType contentType = ContentType.valueOf(contentTypeStr.toUpperCase());
            
            // Extract content items from request
            @SuppressWarnings("unchecked")
            List<Object> contentItems = (List<Object>) requestBody.get("items");
            if (contentItems == null || contentItems.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "No content items provided"));
            }
            
            String importedBy = (String) requestBody.getOrDefault("importedBy", "system");
            String changeSummary = (String) requestBody.getOrDefault("changeSummary", "");
            
            log.info("Importing {} {} items (dryRun={})", contentItems.size(), contentType, dryRun);
            
            ImportResult result = importService.importContent(
                contentType,
                contentItems,
                importedBy,
                changeSummary,
                dryRun
            );
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "importedCount", result.getSuccessfulImports(),
                    "importedIds", result.getImportedIds(),
                    "warnings", result.getWarnings(),
                    "dryRun", dryRun
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "success", false,
                        "errors", result.getErrors(),
                        "warnings", result.getWarnings()
                    ));
            }
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid content type: " + contentTypeStr));
        } catch (Exception e) {
            log.error("Import failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Import failed: " + e.getMessage()));
        }
    }
}
