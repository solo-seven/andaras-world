package com.andara.application.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class GamePersistenceServiceTest {

    private JdbcTemplate jdbcTemplate;
    private ObjectMapper objectMapper;
    private GamePersistenceService service;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        objectMapper = new ObjectMapper();
        service = new GamePersistenceService(jdbcTemplate, objectMapper);
    }

    @Test
    void testSaveGame_CreatesSaveRecord() {
        // Given
        UUID instanceId = UUID.randomUUID();
        UUID characterId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        String characterName = "Test Character";
        String origin = "VAULT_DWELLER";

        // Mock latest event ID query
        when(jdbcTemplate.queryForObject(anyString(), eq(UUID.class), eq(instanceId)))
            .thenReturn(eventId);

        // Mock insert query
        when(jdbcTemplate.update(anyString(), any(), any(), any(), any(), any(), any()))
            .thenReturn(1);

        // When
        UUID saveId = service.saveGame(instanceId, characterId, characterName, origin);

        // Then
        assertNotNull(saveId);
        verify(jdbcTemplate).update(
            anyString(),
            any(UUID.class), // save_id
            eq(instanceId),
            anyString(), // save name
            eq(eventId),
            any(Instant.class),
            anyString() // metadata JSON
        );
    }

    @Test
    void testSaveGame_ThrowsExceptionWhenNoEvents() {
        // Given
        UUID instanceId = UUID.randomUUID();
        UUID characterId = UUID.randomUUID();

        // Mock no events found
        when(jdbcTemplate.queryForObject(anyString(), eq(UUID.class), eq(instanceId)))
            .thenReturn(null);

        // When/Then
        assertThrows(IllegalStateException.class, () -> {
            service.saveGame(instanceId, characterId, "Test", "VAULT_DWELLER");
        });
    }
}

