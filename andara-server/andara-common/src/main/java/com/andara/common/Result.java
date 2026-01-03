package com.andara.common;

import java.util.ArrayList;
import java.util.List;

/**
 * Result type for operations that can succeed or fail.
 * Used for command handling and service operations.
 */
public class Result<T> {
    private final boolean success;
    private final T data;
    private final List<String> errors;

    private Result(boolean success, T data, List<String> errors) {
        this.success = success;
        this.data = data;
        this.errors = List.copyOf(errors);
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(true, data, List.of());
    }

    public static <T> Result<T> failure(String error) {
        return new Result<>(false, null, List.of(error));
    }

    public static <T> Result<T> failure(List<String> errors) {
        return new Result<>(false, null, errors);
    }

    public boolean isSuccess() {
        return success;
    }

    public boolean isFailure() {
        return !success;
    }

    public T getData() {
        if (!success) {
            throw new IllegalStateException("Cannot get data from failed result");
        }
        return data;
    }

    public List<String> getErrors() {
        return errors;
    }

    public String getFirstError() {
        return errors.isEmpty() ? "Unknown error" : errors.get(0);
    }
}

