package com.andara.infrastructure.kafka;

import com.andara.infrastructure.EventPublisher;
import com.andara.domain.DomainEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Kafka implementation of event publisher.
 */
@Component
public class KafkaEventPublisher implements EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(KafkaEventPublisher.class);
    private static final String PARTY_EVENTS_TOPIC = "andara.events.party";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public KafkaEventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void publish(List<DomainEvent> events) {
        for (DomainEvent event : events) {
            try {
                String topic = determineTopic(event);
                // Use instanceId as the partition key to ensure all events for the same instance
                // are processed in order within the same partition, preventing out-of-order issues
                // Fall back to aggregateId if instanceId is missing (defensive against future event types)
                String instanceId = event.getMetadata().get("instanceId");
                String key = instanceId != null ? instanceId : event.getAggregateId();
                
                if (instanceId == null) {
                    log.warn("Event {} of type {} is missing instanceId in metadata. " +
                        "Using aggregateId {} as partition key. This may break ordering guarantees.",
                        event.getEventId(), event.getEventType(), event.getAggregateId());
                }
                
                String value = serializeEvent(event);

                kafkaTemplate.send(topic, key, value)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish event {} to topic {}", event.getEventId(), topic, ex);
                        } else {
                            log.debug("Published event {} to topic {} with partition key {} (instanceId: {})", 
                                event.getEventId(), topic, key, instanceId != null ? instanceId : "none");
                        }
                    });
            } catch (Exception e) {
                log.error("Error publishing event {}", event.getEventId(), e);
            }
        }
    }

    private String determineTopic(DomainEvent event) {
        // Route events to appropriate topics based on aggregate type
        return switch (event.getAggregateType()) {
            case "Character", "Party", "Instance" -> PARTY_EVENTS_TOPIC;
            default -> "andara.events.general";
        };
    }

    private String serializeEvent(DomainEvent event) {
        try {
            Map<String, Object> envelope = Map.of(
                "eventId", event.getEventId().toString(),
                "eventType", event.getEventType(),
                "timestamp", event.getTimestamp().toString(),
                "aggregateId", event.getAggregateId(),
                "aggregateType", event.getAggregateType(),
                "version", event.getVersion(),
                "payload", event.getPayload(),
                "metadata", event.getMetadata()
            );
            return objectMapper.writeValueAsString(envelope);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize event", e);
        }
    }
}

