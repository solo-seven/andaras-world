package com.andara.infrastructure.content;

import com.andara.domain.content.events.ContentReloaded;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Kafka listener that invalidates content caches when content is reloaded.
 */
@Component
public class ContentCacheInvalidationListener {
    private static final Logger log = LoggerFactory.getLogger(ContentCacheInvalidationListener.class);

    @KafkaListener(topics = {"andara.events.content", "andara.events.general"})
    public void handleContentReloaded(Map<String, Object> eventEnvelope) {
        try {
            String eventType = (String) eventEnvelope.get("eventType");
            
            if ("ContentReloaded".equals(eventType)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> payload = (Map<String, Object>) eventEnvelope.get("payload");
                
                String contentType = (String) payload.get("contentType");
                @SuppressWarnings("unchecked")
                java.util.List<String> reloadedIds = (java.util.List<String>) payload.get("reloadedIds");
                
                log.info("Invalidating cache for {} {} items", reloadedIds.size(), contentType);
                
                // TODO: Implement actual cache invalidation
                // This would invalidate entries in a content cache (e.g., Caffeine cache)
                // For now, this is a placeholder
                
            }
        } catch (Exception e) {
            log.error("Error handling content reload event", e);
        }
    }
}
