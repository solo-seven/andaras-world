package com.andara.content.validation;

import com.andara.content.ContentType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Orchestrates all validation layers (schema, references, business rules).
 */
public class ValidationEngine {
    private static final Logger log = LoggerFactory.getLogger(ValidationEngine.class);
    
    private final SchemaValidator schemaValidator;
    private final ReferenceValidator referenceValidator;
    private final BusinessRuleValidator businessRuleValidator;

    public ValidationEngine(
        ObjectMapper objectMapper,
        ReferenceValidator.ReferenceResolver referenceResolver
    ) {
        this.schemaValidator = new SchemaValidator(objectMapper);
        this.referenceValidator = new ReferenceValidator(objectMapper, referenceResolver);
        this.businessRuleValidator = new BusinessRuleValidator(objectMapper);
    }

    /**
     * Validate content through all validation layers.
     * 
     * @param contentType The type of content being validated
     * @param content The content object to validate
     * @return Validation result with errors, warnings, and suggestions
     */
    public ValidationResult validate(ContentType contentType, Object content) {
        log.debug("Validating {} content", contentType);
        
        List<ValidationResult> results = new ArrayList<>();
        
        // Layer 1: Schema validation
        ValidationResult schemaResult = schemaValidator.validate(contentType, content);
        results.add(schemaResult);
        
        if (!schemaResult.isValid()) {
            log.debug("Schema validation failed, skipping further validation");
            return ValidationResult.combine(results);
        }
        
        // Layer 2: Reference validation (only if schema passes)
        ValidationResult referenceResult = referenceValidator.validate(contentType, content);
        results.add(referenceResult);
        
        // Layer 3: Business rule validation (always runs, produces warnings)
        ValidationResult businessResult = businessRuleValidator.validate(contentType, content);
        results.add(businessResult);
        
        return ValidationResult.combine(results);
    }

    /**
     * Validate multiple content items.
     */
    public ValidationResult validateBatch(ContentType contentType, List<Object> contents) {
        List<ValidationResult> results = new ArrayList<>();
        
        for (int i = 0; i < contents.size(); i++) {
            final int itemIndex = i + 1; // Make effectively final for lambda
            Object content = contents.get(i);
            ValidationResult result = validate(contentType, content);
            if (!result.isValid()) {
                // Add index context to errors, but preserve warnings
                List<String> contextualErrors = new ArrayList<>();
                for (String error : result.getErrors()) {
                    contextualErrors.add(String.format("[Item %d] %s", itemIndex, error));
                }
                // Preserve warnings even when there are errors
                if (!result.getWarnings().isEmpty()) {
                    List<String> contextualWarnings = new ArrayList<>();
                    for (String warning : result.getWarnings()) {
                        contextualWarnings.add(String.format("[Item %d] %s", itemIndex, warning));
                    }
                    // Create a result with both errors and warnings
                    results.add(ValidationResult.failureWithWarnings(contextualErrors, contextualWarnings));
                } else {
                    results.add(ValidationResult.failure(contextualErrors));
                }
            } else {
                results.add(result);
            }
        }
        
        return ValidationResult.combine(results);
    }
}
