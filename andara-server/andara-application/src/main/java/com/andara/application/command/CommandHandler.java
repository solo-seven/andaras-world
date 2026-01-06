package com.andara.application.command;

import com.andara.common.Result;
import com.andara.domain.DomainEvent;

import java.util.List;

/**
 * Interface for command handlers.
 * Handlers process commands and return results containing domain events.
 * 
 * @param <C> Command type
 */
public interface CommandHandler<C extends Command> {
    /**
     * Handle a command.
     * 
     * @param command Command to handle
     * @return Result containing list of domain events produced, or failure
     */
    Result<List<DomainEvent>> handle(C command);
}
