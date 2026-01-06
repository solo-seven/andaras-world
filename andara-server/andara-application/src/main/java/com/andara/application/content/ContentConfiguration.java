package com.andara.application.content;

import com.andara.content.ContentType;
import com.andara.content.validation.ReferenceValidator;
import com.andara.content.validation.ValidationEngine;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for content management services.
 */
@Configuration
public class ContentConfiguration {

    @Bean
    public ReferenceValidator.ReferenceResolver referenceResolver(ContentRepositoryService repositoryService) {
        return new DatabaseReferenceResolver(repositoryService);
    }

    @Bean
    public ValidationEngine validationEngine(
        ObjectMapper objectMapper,
        ReferenceValidator.ReferenceResolver referenceResolver
    ) {
        return new ValidationEngine(objectMapper, referenceResolver);
    }

    /**
     * Implementation of ReferenceResolver that checks the database.
     */
    private static class DatabaseReferenceResolver implements ReferenceValidator.ReferenceResolver {
        private final ContentRepositoryService repositoryService;

        public DatabaseReferenceResolver(ContentRepositoryService repositoryService) {
            this.repositoryService = repositoryService;
        }

        @Override
        public boolean exists(ContentType type, String id) {
            return repositoryService.exists(type, id);
        }
    }
}
