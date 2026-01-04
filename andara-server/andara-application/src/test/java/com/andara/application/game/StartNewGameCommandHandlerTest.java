package com.andara.application.game;

import com.andara.application.persistence.GamePersistenceService;
import com.andara.infrastructure.CharacterRepository;
import com.andara.infrastructure.EventPublisher;
import com.andara.domain.DomainEvent;
import com.andara.domain.party.Appearance;
import com.andara.domain.party.Attributes;
import com.andara.domain.party.Origin;
import com.andara.infrastructure.eventstore.EventStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StartNewGameCommandHandlerTest {

    @Mock
    private EventStore eventStore;

    @Mock
    private CharacterRepository characterRepository;

    @Mock
    private EventPublisher eventPublisher;

    @Mock
    private GamePersistenceService persistenceService;

    private StartNewGameCommandHandler handler;

    @BeforeEach
    void setUp() {
        handler = new StartNewGameCommandHandler(
            eventStore,
            characterRepository,
            eventPublisher,
            persistenceService
        );
    }

    @Test
    void handle_createsInstancePartyAndCharacter() {
        // Given
        when(persistenceService.saveGame(any(), any(), anyString(), anyString()))
            .thenReturn(UUID.randomUUID());
        
        StartNewGameCommand command = new StartNewGameCommand(
            "Test Character",
            Origin.VAULT_DWELLER,
            Attributes.create(10, 10, 10, 10, 10, 10),
            List.of("skill1", "skill2"),
            Appearance.defaultAppearance(),
            UUID.randomUUID()
        );

        // When
        StartNewGameCommandHandler.StartNewGameResponse response = handler.handle(command);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.instanceId()).isNotNull();
        assertThat(response.partyId()).isNotNull();
        assertThat(response.characterId()).isNotNull();

        // Verify Instance was saved
        ArgumentCaptor<String> instanceIdCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> instanceTypeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<List<DomainEvent>> instanceEventsCaptor = ArgumentCaptor.forClass(List.class);
        
        verify(eventStore, atLeastOnce()).append(
            instanceIdCaptor.capture(),
            instanceTypeCaptor.capture(),
            instanceEventsCaptor.capture()
        );

        // Verify Party was saved
        verify(characterRepository).save(any());

        // Verify events were published
        verify(eventPublisher).publish(any(List.class));
        
        // Verify save game was created
        verify(persistenceService).saveGame(
            any(UUID.class),
            any(UUID.class),
            eq("Test Character"),
            anyString()
        );
    }

    @Test
    void handle_validatesCommand() {
        // Given/When/Then - invalid command (missing name) should throw IllegalArgumentException during construction
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            new StartNewGameCommand(
                "",
                Origin.VAULT_DWELLER,
                Attributes.create(10, 10, 10, 10, 10, 10),
                List.of("skill1", "skill2"),
                Appearance.defaultAppearance(),
                UUID.randomUUID()
            );
        });
        
        assertThat(exception.getMessage()).contains("name");
    }
}
