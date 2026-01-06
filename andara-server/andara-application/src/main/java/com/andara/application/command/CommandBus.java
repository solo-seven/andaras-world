package com.andara.application.command;

import com.andara.common.Result;
import com.andara.domain.DomainEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Command bus for routing commands to their handlers.
 * Provides a centralized point for command execution.
 */
@Service
public class CommandBus {
    
    private static final Logger log = LoggerFactory.getLogger(CommandBus.class);
    
    private final Map<Class<? extends Command>, CommandHandler<?>> handlers = new HashMap<>();
    
    /**
     * Register a command handler.
     * 
     * @param commandType Command class
     * @param handler Handler instance
     * @param <C> Command type
     */
    public <C extends Command> void register(Class<C> commandType, CommandHandler<C> handler) {
        if (handlers.containsKey(commandType)) {
            log.warn("Overriding existing handler for command type: {}", commandType.getName());
        }
        handlers.put(commandType, handler);
        log.debug("Registered handler for command type: {}", commandType.getName());
    }
    
    /**
     * Send a command to its handler.
     * 
     * @param command Command to execute
     * @param <C> Command type
     * @return Result containing domain events or failure
     * @throws NoHandlerException if no handler is registered for the command type
     */
    @SuppressWarnings("unchecked")
    public <C extends Command> Result<List<DomainEvent>> send(C command) {
        Class<? extends Command> commandType = command.getClass();
        CommandHandler<?> handler = handlers.get(commandType);
        
        if (handler == null) {
            throw new NoHandlerException(commandType);
        }
        
        log.debug("Routing command {} to handler", commandType.getSimpleName());
        return ((CommandHandler<C>) handler).handle(command);
    }
    
    /**
     * Exception thrown when no handler is found for a command.
     */
    public static class NoHandlerException extends RuntimeException {
        public NoHandlerException(Class<? extends Command> commandType) {
            super("No handler registered for command type: " + commandType.getName());
        }
    }
}
