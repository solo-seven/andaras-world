package com.andara;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

/**
 * Test configuration to mock external dependencies.
 */
@TestConfiguration
public class AndaraTestConfiguration {
    
    @MockBean
    private KafkaTemplate<String, String> kafkaTemplate;
}

