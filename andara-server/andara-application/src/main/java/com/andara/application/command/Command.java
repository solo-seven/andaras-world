package com.andara.application.command;

import com.andara.domain.AgentId;

/**
 * Marker interface for all domain commands.
 * Commands represent user intentions to change system state.
 */
public interface Command {
    /**
     * Get the agent that issued this command.
     * 
     * @return Agent identifier
     */
    AgentId issuedBy();
}
