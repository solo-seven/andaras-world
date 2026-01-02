package com.andara;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(AndaraTestConfiguration.class)
class AndaraServerApplicationTest {

    @Test
    void contextLoads() {
        // Test that the application context loads successfully
    }
}

