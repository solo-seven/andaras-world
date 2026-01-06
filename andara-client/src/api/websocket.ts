import type { WebSocketMessage, WebSocketEvent, ConnectionState } from './types';

type EventCallback = (data: unknown) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connectionState: ConnectionState = 'disconnected';
  private reconnectTimer: number | null = null;
  private onStateChangeCallback?: (state: ConnectionState) => void;

  constructor() {
    // Get WebSocket URL from environment
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
    this.url = wsUrl;
  }

  /**
   * Connect to WebSocket server
   */
  connect(url?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (url) {
      this.url = url;
    }

    if (!this.url) {
      console.error('WebSocket URL not configured');
      return;
    }

    this.setConnectionState('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.setConnectionState('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.setConnectionState('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.setConnectionState('disconnected');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.setConnectionState('disconnected');
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setConnectionState('disconnected');
    this.reconnectAttempts = 0;
  }

  /**
   * Send a message through WebSocket
   */
  send(message: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Set callback for connection state changes
   */
  onStateChange(callback: (state: ConnectionState) => void): void {
    this.onStateChangeCallback = callback;
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(state);
      }
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const event: WebSocketEvent = {
      type: message.type as WebSocketEvent['type'],
      data: message.data,
      timestamp: message.timestamp || Date.now(),
    };

    // Notify listeners for this specific event type
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(event.data);
        } catch (error) {
          console.error(`Error in WebSocket event callback for ${event.type}:`, error);
        }
      });
    }

    // Also notify listeners for wildcard '*'
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in WebSocket wildcard callback:', error);
        }
      });
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`
      );
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionState('reconnecting');

    const delay = this.reconnectDelay * this.reconnectAttempts;
    console.log(
      `Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }
}

export const wsManager = new WebSocketManager();
export default wsManager;
