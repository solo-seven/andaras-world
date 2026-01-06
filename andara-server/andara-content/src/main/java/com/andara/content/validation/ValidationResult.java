package com.andara.content.validation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Result of content validation, containing errors, warnings, and suggestions.
 */
public class ValidationResult {
    private final boolean valid;
    private final List<String> errors;
    private final List<String> warnings;
    private final List<String> suggestions;

    public ValidationResult(boolean valid, List<String> errors, List<String> warnings, List<String> suggestions) {
        this.valid = valid;
        this.errors = errors != null ? Collections.unmodifiableList(new ArrayList<>(errors)) : Collections.emptyList();
        this.warnings = warnings != null ? Collections.unmodifiableList(new ArrayList<>(warnings)) : Collections.emptyList();
        this.suggestions = suggestions != null ? Collections.unmodifiableList(new ArrayList<>(suggestions)) : Collections.emptyList();
    }

    public static ValidationResult success() {
        return new ValidationResult(true, null, null, null);
    }

    public static ValidationResult failure(List<String> errors) {
        return new ValidationResult(false, errors, null, null);
    }

    public static ValidationResult withWarnings(List<String> warnings) {
        return new ValidationResult(true, null, warnings, null);
    }

    public static ValidationResult withSuggestions(List<String> suggestions) {
        return new ValidationResult(true, null, null, suggestions);
    }

    /**
     * Create a validation result with both errors and warnings.
     * Used when validation fails but warnings should still be reported.
     */
    public static ValidationResult failureWithWarnings(List<String> errors, List<String> warnings) {
        return new ValidationResult(false, errors, warnings, null);
    }

    public boolean isValid() {
        return valid;
    }

    public List<String> getErrors() {
        return errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    /**
     * Combine multiple validation results into one.
     */
    public static ValidationResult combine(List<ValidationResult> results) {
        List<String> allErrors = new ArrayList<>();
        List<String> allWarnings = new ArrayList<>();
        List<String> allSuggestions = new ArrayList<>();
        boolean allValid = true;

        for (ValidationResult result : results) {
            if (!result.isValid()) {
                allValid = false;
            }
            allErrors.addAll(result.getErrors());
            allWarnings.addAll(result.getWarnings());
            allSuggestions.addAll(result.getSuggestions());
        }

        return new ValidationResult(allValid, allErrors, allWarnings, allSuggestions);
    }
}
