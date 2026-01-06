import { Middleware } from '@reduxjs/toolkit';
import wsManager from '../../api/websocket';
import type { WebSocketEvent, ConnectionState } from '../../api/types';

/**
 * Redux middleware for handling WebSocket messages
 * Listens for WebSocket events and dispatches actions to the store
 */
// Store unsubscribe function and initialization flag at module level to handle hot module reloading
let unsubscribeEvents: (() => void) | null = null;
let stateChangeCallback: ((state: ConnectionState) => void) | null = null;
let isInitialized = false;

/**
 * Redux middleware for handling WebSocket messages
 * Listens for WebSocket events and dispatches actions to the store
 */
export const websocketMiddleware: Middleware = (store) => {
  // Clean up previous subscriptions if they exist (handles hot module reloading)
  // Reset isInitialized to allow re-initialization after cleanup
  if (unsubscribeEvents) {
    unsubscribeEvents();
    unsubscribeEvents = null;
    isInitialized = false; // Reset flag to allow re-initialization
  }
  
  // Clear previous state change callback
  if (stateChangeCallback) {
    // Note: onStateChange doesn't provide unsubscribe, but setting a new callback replaces it
    stateChangeCallback = null;
  }
  
  // Only initialize subscriptions if not already initialized
  if (!isInitialized) {
    // Subscribe to all WebSocket events
    unsubscribeEvents = wsManager.subscribe('*', (event: unknown) => {
      const wsEvent = event as WebSocketEvent;

      // Map WebSocket event types to Redux actions
      switch (wsEvent.type) {
        case 'game.state.update':
          store.dispatch({
            type: 'game/updateState',
            payload: wsEvent.data,
          });
          break;

        case 'party.moved':
          store.dispatch({
            type: 'party/updatePosition',
            payload: wsEvent.data,
          });
          break;

        case 'combat.started':
          store.dispatch({
            type: 'combat/startCombat',
            payload: wsEvent.data,
          });
          break;

        case 'combat.ended':
          store.dispatch({
            type: 'combat/endCombat',
            payload: wsEvent.data,
          });
          break;

        case 'character.status.changed':
          store.dispatch({
            type: 'party/updateCharacterStatus',
            payload: wsEvent.data,
          });
          break;

        case 'zone.changed':
          store.dispatch({
            type: 'world/updateZone',
            payload: wsEvent.data,
          });
          break;

        case 'notification':
          store.dispatch({
            type: 'ui/addNotification',
            payload: wsEvent.data,
          });
          break;

        case 'error':
          store.dispatch({
            type: 'ui/addNotification',
            payload: {
              type: 'error',
              message: (wsEvent.data as { message?: string })?.message || 'An error occurred',
              timestamp: wsEvent.timestamp,
            },
          });
          break;

        default:
          // Generic handler for unknown event types
          store.dispatch({
            type: `websocket/${wsEvent.type}`,
            payload: wsEvent.data,
            meta: {
              timestamp: wsEvent.timestamp,
            },
          });
      }
    });

    // Handle connection state changes
    stateChangeCallback = (state: ConnectionState) => {
      store.dispatch({
        type: 'websocket/connectionStateChanged',
        payload: state,
      });
    };
    wsManager.onStateChange(stateChangeCallback);

    isInitialized = true;
  }

  // Return middleware function
  return (next) => (action: any) => {
    // Handle WebSocket connection actions
    // These actions trigger side effects but should still pass through the middleware chain
    if (action.type === 'websocket/connect') {
      wsManager.connect(action.payload?.url);
      // Continue the action through the middleware chain
      return next(action);
    }

    if (action.type === 'websocket/disconnect') {
      wsManager.disconnect();
      // Continue the action through the middleware chain
      return next(action);
    }

    if (action.type === 'websocket/send') {
      wsManager.send(action.payload);
      // Continue the action through the middleware chain
      return next(action);
    }

    return next(action);
  };
};
