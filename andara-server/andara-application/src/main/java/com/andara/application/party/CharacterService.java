package com.andara.application.party;

import com.andara.common.Result;
import com.andara.domain.DomainEvent;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application service for character operations.
 */
@Service
public class CharacterService {

    private final CreateCharacterCommandHandler commandHandler;

    public CharacterService(CreateCharacterCommandHandler commandHandler) {
        this.commandHandler = commandHandler;
    }

    public Result<List<DomainEvent>> createCharacter(CreateCharacterCommand command) {
        return commandHandler.handle(command);
    }
}

