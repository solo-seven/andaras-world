package com.andara.infrastructure.kafka;

import com.andara.infrastructure.EventPublisher;
import com.andara.domain.DomainEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

/**
 * Kafka implementation of event publisher.
 * Publishes events to Kafka topics with retry mechanism and proper topic routing.
 */
@Component
public class KafkaEventPublisher implements EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(KafkaEventPublisher.class);
    private static final int MAX_RETRIES = 3;
    
    // Topic constants per epic specification
    private static final String WORLD_EVENTS_TOPIC = "andara.events.world";
    private static final String PARTY_EVENTS_TOPIC = "andara.events.party";
    private static final String ENCOUNTER_EVENTS_TOPIC = "andara.events.encounter";
    private static final String AGENT_EVENTS_TOPIC = "andara.events.agent";

    private final KafkaTemplate<String, EventEnvelope> kafkaTemplate;

    public KafkaEventPublisher(KafkaTemplate<String, EventEnvelope> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public CompletableFuture<Void> publish(List<DomainEvent> events) {
        if (events.isEmpty()) {
            return CompletableFuture.completedFuture(null);
        }

        List<CompletableFuture<SendResult<String, EventEnvelope>>> futures = new ArrayList<>();
        
        for (DomainEvent event : events) {
            String topic = determineTopic(event);
            // Use instanceId as Kafka message key for partition ordering
            // This ensures all events for the same game instance are processed in order,
            // even if they come from different aggregates (Instance, Party, Character, etc.)
            String instanceId = event.getMetadata().get("instanceId");
            String key = instanceId != null ? instanceId : event.getAggregateId();
            
            if (instanceId == null) {
                log.warn("Event {} of type {} is missing instanceId in metadata. " +
                        "Using aggregateId {} as partition key. This may break ordering guarantees.",
                    event.getEventId(), event.getEventType(), event.getAggregateId());
            }
            
            EventEnvelope envelope = EventEnvelope.from(event);
            
            CompletableFuture<SendResult<String, EventEnvelope>> future = 
                sendWithRetry(topic, key, envelope, 0);
            futures.add(future);
        }
        
        // Combine all futures and return a single CompletableFuture
        CompletableFuture<?>[] futuresArray = futures.toArray(new CompletableFuture[0]);
        return CompletableFuture.allOf(futuresArray)
            .<Void>thenApply(v -> null)
            .exceptionally(ex -> {
                log.error("Failed to publish some events", ex);
                throw new CompletionException("Failed to publish events", ex);
            });
    }

    /**
     * Send event with retry mechanism.
     * Uses async chaining to avoid blocking thread pool threads.
     */
    private CompletableFuture<SendResult<String, EventEnvelope>> sendWithRetry(
        String topic,
        String key,
        EventEnvelope envelope,
        int attempt
    ) {
        CompletableFuture<SendResult<String, EventEnvelope>> future = kafkaTemplate.send(topic, key, envelope);
        
        return future
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.warn("Failed to publish event {} to topic {} (attempt {}/{})", 
                        envelope.eventId(), topic, attempt + 1, MAX_RETRIES, ex);
                } else {
                    log.debug("Published event {} to topic {} with key {}", 
                        envelope.eventId(), topic, key);
                }
            })
            .handle((result, ex) -> {
                if (ex != null && attempt < MAX_RETRIES - 1) {
                    // Retry needed - return null to signal retry (no blocking)
                    log.info("Retrying publish of event {} to topic {} (attempt {}/{})", 
                        envelope.eventId(), topic, attempt + 2, MAX_RETRIES);
                    return null; // Signal that retry is needed
                } else if (ex != null) {
                    // Max retries reached
                    log.error("Failed to publish event {} to topic {} after {} attempts", 
                        envelope.eventId(), topic, MAX_RETRIES, ex);
                    throw new CompletionException("Failed to publish event after retries", ex);
                }
                return result;
            })
            .thenCompose(result -> {
                if (result == null && attempt < MAX_RETRIES - 1) {
                    // Chain the retry asynchronously (no blocking - thenCompose chains futures)
                    return sendWithRetry(topic, key, envelope, attempt + 1);
                } else if (result == null) {
                    // Should not happen, but handle gracefully
                    CompletableFuture<SendResult<String, EventEnvelope>> failed = new CompletableFuture<>();
                    failed.completeExceptionally(new RuntimeException("Failed to publish event after retries"));
                    return failed;
                }
                // Success - return completed future
                return CompletableFuture.completedFuture(result);
            });
    }

    /**
     * Determine the Kafka topic for an event based on aggregate type.
     * Follows epic specification for topic naming.
     */
    private String determineTopic(DomainEvent event) {
        String aggregateType = event.getAggregateType();
        
        return switch (aggregateType) {
            // Party context events
            case "Party", "Character", "Inventory" -> PARTY_EVENTS_TOPIC;
            
            // World context events
            case "Region", "Zone", "POI", "Instance" -> WORLD_EVENTS_TOPIC;
            
            // Encounter context events
            case "Encounter", "CombatState" -> ENCOUNTER_EVENTS_TOPIC;
            
            // Agent context events
            case "Agent", "AgentSession" -> AGENT_EVENTS_TOPIC;
            
            // Content events (legacy)
            case "Content" -> "andara.events.content";
            
            // Default fallback
            default -> {
                log.warn("Unknown aggregate type {}, using general topic", aggregateType);
                yield "andara.events.general";
            }
        };
    }
}

