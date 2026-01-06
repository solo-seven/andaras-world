package com.andara.content.validation;

import com.andara.content.ContentType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonschema.core.exceptions.ProcessingException;
import com.github.fge.jsonschema.core.load.configuration.LoadingConfiguration;
import com.github.fge.jsonschema.core.load.uri.URITranslatorConfiguration;
import com.github.fge.jsonschema.main.JsonSchema;
import com.github.fge.jsonschema.main.JsonSchemaFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Validates content against JSON Schema definitions.
 */
public class SchemaValidator {
    private static final Logger log = LoggerFactory.getLogger(SchemaValidator.class);
    private static final String SCHEMA_BASE_PATH = "/docs/content-schemas/";
    
    private final ObjectMapper objectMapper;
    private final JsonSchemaFactory schemaFactory;
    
    public SchemaValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        
        // Configure schema factory to resolve relative references
        // Use default configuration - don't set empty namespace as it requires absolute URI
        LoadingConfiguration loadingCfg = LoadingConfiguration.newBuilder()
            .freeze();
        
        this.schemaFactory = JsonSchemaFactory.newBuilder()
            .setLoadingConfiguration(loadingCfg)
            .freeze();
    }

    public ValidationResult validate(ContentType contentType, Object content) {
        List<String> errors = new ArrayList<>();
        
        try {
            // Load schema
            JsonSchema schema = loadSchema(contentType);
            
            // Convert content to JsonNode
            JsonNode contentNode = objectMapper.valueToTree(content);
            
            // Validate
            com.github.fge.jsonschema.core.report.ProcessingReport report = schema.validate(contentNode);
            
            if (!report.isSuccess()) {
                report.forEach(message -> {
                    // ProcessingMessage API: getMessage() provides the error message
                    // The message typically includes the path/pointer information
                    String errorMsg = "Schema validation error: " + message.getMessage();
                    errors.add(errorMsg);
                    log.debug("Schema validation error: {}", errorMsg);
                });
            }
            
        } catch (ProcessingException e) {
            errors.add("Failed to process schema: " + e.getMessage());
            log.error("Schema processing error", e);
        } catch (Exception e) {
            errors.add("Validation error: " + e.getMessage());
            log.error("Unexpected validation error", e);
        }
        
        return errors.isEmpty() ? ValidationResult.success() : ValidationResult.failure(errors);
    }

    private JsonSchema loadSchema(ContentType contentType) throws IOException, ProcessingException {
        // Try to load from classpath first (for packaged apps)
        String schemaPath = SCHEMA_BASE_PATH + contentType.getSchemaPath();
        InputStream schemaStream = getClass().getResourceAsStream(schemaPath);
        
        if (schemaStream == null) {
            // Try loading from filesystem (for development)
            // Assume we're in a workspace with docs/content-schemas at the root
            java.nio.file.Path workspacePath = java.nio.file.Paths.get("docs/content-schemas/" + contentType.getSchemaPath());
            if (java.nio.file.Files.exists(workspacePath)) {
                schemaStream = java.nio.file.Files.newInputStream(workspacePath);
            } else {
                // Try from classloader as fallback
                schemaStream = getClass().getClassLoader().getResourceAsStream(schemaPath);
                if (schemaStream == null) {
                    throw new IOException("Schema not found: " + schemaPath + " (also tried: " + workspacePath + ")");
                }
            }
        }
        
        try {
            JsonNode schemaNode = objectMapper.readTree(schemaStream);
            return schemaFactory.getJsonSchema(schemaNode);
        } finally {
            if (schemaStream != null) {
                schemaStream.close();
            }
        }
    }
}
