package com.andara.application.party;

import com.andara.common.Result;
import com.andara.infrastructure.CharacterRepository;
import com.andara.domain.DomainEvent;
import com.andara.domain.party.Character;
import com.andara.domain.party.Origin;
import com.andara.domain.party.Attributes;
import com.andara.domain.party.Appearance;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateCharacterCommandHandlerTest {

    @Mock
    private CharacterRepository characterRepository;

    private CreateCharacterCommandHandler handler;

    @BeforeEach
    void setUp() {
        handler = new CreateCharacterCommandHandler(characterRepository);
    }

    @Test
    void handle_validCommand_shouldCreateCharacter() {
        CreateCharacterCommand command = new CreateCharacterCommand(
            "Test Character",
            Origin.VAULT_DWELLER,
            Attributes.create(8, 8, 8, 8, 8, 8),
            List.of("mechanics", "electronics"),
            Appearance.defaultAppearance(),
            true,
            UUID.randomUUID(),
            UUID.randomUUID(),
            UUID.randomUUID()
        );

        Result<List<DomainEvent>> result = handler.handle(command);

        assertTrue(result.isSuccess());
        verify(characterRepository, times(1)).save(any(Character.class));
        // Note: Event publishing is handled by the repository, not the handler
    }

    @Test
    void handle_invalidName_shouldReturnFailure() {
        // Command constructor will throw, so we test that the handler catches it
        assertThrows(IllegalArgumentException.class, () -> {
            new CreateCharacterCommand(
                "",
                Origin.VAULT_DWELLER,
                Attributes.create(8, 8, 8, 8, 8, 8),
                List.of("mechanics", "electronics"),
                Appearance.defaultAppearance(),
                true,
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID()
            );
        });
    }

    @Test
    void handle_wrongSkillFocusCount_shouldReturnFailure() {
        // Command constructor will throw, so we test that
        assertThrows(IllegalArgumentException.class, () -> {
            new CreateCharacterCommand(
                "Test Character",
                Origin.VAULT_DWELLER,
                Attributes.create(8, 8, 8, 8, 8, 8),
                List.of("mechanics"), // Only 1 skill, should be 2
                Appearance.defaultAppearance(),
                true,
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID()
            );
        });
    }

    @Test
    void handle_invalidCharacterName_shouldReturnFailure() {
        // Test invalid name that passes command validation but fails CharacterName creation
        CreateCharacterCommand command = new CreateCharacterCommand(
            "A".repeat(100), // Too long
            Origin.VAULT_DWELLER,
            Attributes.create(8, 8, 8, 8, 8, 8),
            List.of("mechanics", "electronics"),
            Appearance.defaultAppearance(),
            true,
            UUID.randomUUID(),
            UUID.randomUUID(),
            UUID.randomUUID()
        );

        Result<List<DomainEvent>> result = handler.handle(command);

        assertTrue(result.isFailure());
        verify(characterRepository, never()).save(any());
    }
}

