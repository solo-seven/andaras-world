package com.andara.api.content;

import com.andara.application.content.ContentExportService;
import com.andara.content.ContentType;
import com.andara.content.model.ExportResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

/**
 * REST controller for content export operations.
 * TODO: Add @PreAuthorize("hasRole('ADMIN')") when authentication is implemented
 */
@RestController
@RequestMapping("/api/admin/content")
public class ContentExportController {
    private static final Logger log = LoggerFactory.getLogger(ContentExportController.class);
    
    private final ContentExportService exportService;

    public ContentExportController(ContentExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/export")
    // TODO: @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> exportContent(
        @RequestParam("type") String contentTypeStr,
        @RequestParam(value = "outputDir", defaultValue = "./content-export") String outputDir,
        @RequestParam(value = "exportedBy", defaultValue = "system") String exportedBy,
        @RequestParam(value = "environment", defaultValue = "unknown") String environment
    ) {
        try {
            ContentType contentType = ContentType.valueOf(contentTypeStr.toUpperCase());
            Path outputPath = Paths.get(outputDir);
            
            log.info("Exporting {} content to {}", contentType, outputPath);
            
            ExportResult result = exportService.exportContent(
                contentType,
                outputPath,
                exportedBy,
                environment
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "exportedCount", result.getExportedCount(),
                "outputDirectory", result.getOutputDirectory(),
                "manifestPath", result.getManifestPath(),
                "errors", result.getErrors() != null ? result.getErrors() : java.util.Collections.emptyList()
            ));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid content type: " + contentTypeStr));
        } catch (Exception e) {
            log.error("Export failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Export failed: " + e.getMessage()));
        }
    }
}
