package com.andara.application.command;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.GenericTypeResolver;
import org.springframework.stereotype.Component;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Map;

/**
 * Component that automatically registers command handlers with the CommandBus.
 * Scans for components annotated with @CommandHandlerAnnotation and registers them.
 */
@Component
public class CommandHandlerRegistrar {
    
    private static final Logger log = LoggerFactory.getLogger(CommandHandlerRegistrar.class);
    
    private final CommandBus commandBus;
    private final ApplicationContext applicationContext;
    
    @Autowired
    public CommandHandlerRegistrar(CommandBus commandBus, ApplicationContext applicationContext) {
        this.commandBus = commandBus;
        this.applicationContext = applicationContext;
    }
    
    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {
        Map<String, Object> handlers = applicationContext.getBeansWithAnnotation(CommandHandlerAnnotation.class);
        
        for (Object handler : handlers.values()) {
            if (handler instanceof CommandHandler<?>) {
                registerHandler((CommandHandler<?>) handler);
            }
        }
        
        log.info("Registered {} command handlers", handlers.size());
    }
    
    @SuppressWarnings({"unchecked", "rawtypes"})
    private void registerHandler(CommandHandler<?> handler) {
        // Extract the command type from the handler's generic type parameter
        Type[] interfaces = handler.getClass().getGenericInterfaces();
        for (Type interfaceType : interfaces) {
            if (interfaceType instanceof ParameterizedType) {
                ParameterizedType paramType = (ParameterizedType) interfaceType;
                if (CommandHandler.class.equals(paramType.getRawType())) {
                    Type[] typeArgs = paramType.getActualTypeArguments();
                    if (typeArgs.length > 0 && typeArgs[0] instanceof Class) {
                        Class<? extends Command> commandType = (Class<? extends Command>) typeArgs[0];
                        commandBus.register(commandType, (CommandHandler) handler);
                        log.debug("Auto-registered handler {} for command {}", 
                            handler.getClass().getSimpleName(), commandType.getSimpleName());
                        return;
                    }
                }
            }
        }
        
        // Fallback: try to find command type using Spring's GenericTypeResolver
        Class<?>[] typeArgs = GenericTypeResolver.resolveTypeArguments(
            handler.getClass(), CommandHandler.class);
        if (typeArgs != null && typeArgs.length > 0) {
            Class<? extends Command> commandType = (Class<? extends Command>) typeArgs[0];
            commandBus.register(commandType, (CommandHandler) handler);
            log.debug("Auto-registered handler {} for command {} (via GenericTypeResolver)", 
                handler.getClass().getSimpleName(), commandType.getSimpleName());
        } else {
            log.warn("Could not determine command type for handler: {}", handler.getClass().getName());
        }
    }
}
