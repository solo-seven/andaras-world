package com.andara.content.model;

import com.andara.content.validation.ValidationResult;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Result of a content import operation, containing success/failure information.
 */
public class ImportResult {
    private final boolean success;
    private final int totalItems;
    private final int successfulImports;
    private final List<String> importedIds;
    private final List<String> errors;
    private final List<String> warnings;

    private ImportResult(
        boolean success,
        int totalItems,
        int successfulImports,
        List<String> importedIds,
        List<String> errors,
        List<String> warnings
    ) {
        this.success = success;
        this.totalItems = totalItems;
        this.successfulImports = successfulImports;
        this.importedIds = importedIds != null ? Collections.unmodifiableList(importedIds) : Collections.emptyList();
        this.errors = errors != null ? Collections.unmodifiableList(errors) : Collections.emptyList();
        this.warnings = warnings != null ? Collections.unmodifiableList(warnings) : Collections.emptyList();
    }

    public static ImportResult success(List<String> importedIds) {
        return new ImportResult(true, importedIds.size(), importedIds.size(), importedIds, null, null);
    }

    public static ImportResult failure(List<String> errors) {
        return new ImportResult(false, 0, 0, null, errors, null);
    }

    public static ImportResult partial(List<String> importedIds, List<String> errors) {
        int total = importedIds.size() + errors.size();
        return new ImportResult(errors.isEmpty(), total, importedIds.size(), importedIds, errors, null);
    }

    public static ImportResult withWarnings(List<String> importedIds, List<String> warnings) {
        return new ImportResult(true, importedIds.size(), importedIds.size(), importedIds, null, warnings);
    }

    public static ImportResult dryRun(ValidationResult validation) {
        // For dry run, we don't have imported IDs, but we can report validation status
        boolean isValid = validation.isValid();
        return new ImportResult(
            isValid,
            0,
            0,
            null,
            validation.getErrors(),
            validation.getWarnings()
        );
    }

    public boolean isSuccess() {
        return success;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public int getSuccessfulImports() {
        return successfulImports;
    }

    public List<String> getImportedIds() {
        return importedIds;
    }

    public List<String> getErrors() {
        return errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }
}
