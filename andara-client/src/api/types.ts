/**
 * API Request and Response Types
 */

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp?: number;
}

export interface WebSocketEvent {
  type:
    | 'game.state.update'
    | 'party.moved'
    | 'combat.started'
    | 'combat.ended'
    | 'character.status.changed'
    | 'zone.changed'
    | 'notification'
    | 'error';
  data: unknown;
  timestamp: number;
}

// Connection State
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// API Error
export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}
