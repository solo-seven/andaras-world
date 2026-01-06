package com.andara.domain;

/**
 * Exception thrown when a concurrency conflict is detected.
 * This typically occurs when attempting to append events with a sequence number
 * that already exists for the same aggregate (optimistic locking violation).
 */
public class ConcurrencyException extends RuntimeException {
    public ConcurrencyException(String message) {
        super(message);
    }

    public ConcurrencyException(String message, Throwable cause) {
        super(message, cause);
    }
}
