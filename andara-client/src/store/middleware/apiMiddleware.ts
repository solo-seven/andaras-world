import { Middleware } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

/**
 * Redux middleware for handling API actions
 * Intercepts actions with specific patterns and makes API calls
 */
export const apiMiddleware: Middleware = (store) => (next) => async (action: any) => {
  // Check if this is an API action (ends with Async)
  if (typeof action.type !== 'string' || !action.type.endsWith('Async')) {
    return next(action);
  }

  const actionType = action.type.replace('Async', '');
  const [_slice, _actionName] = actionType.split('/');

  // Dispatch pending action
  store.dispatch({
    type: `${actionType}Pending`,
    meta: action.meta,
  });

  try {
    let result;

    // Route to appropriate API method based on action type
    switch (actionType) {
      case 'party/moveParty': {
        const { partyId, targetZoneId } = action.payload;
        const { moveParty } = await import('../../api/gameApi');
        result = await moveParty(partyId, targetZoneId);
        break;
      }

      case 'game/executeAction': {
        const { executeAction } = await import('../../api/gameApi');
        result = await executeAction(action.payload);
        break;
      }

      case 'game/command': {
        const { command } = await import('../../api/gameApi');
        result = await command(action.payload);
        break;
      }

      case 'game/query': {
        const { query } = await import('../../api/gameApi');
        result = await query(action.payload);
        break;
      }

      default:
        // If no specific handler, try to call API client directly
        if (action.payload?.method && action.payload?.url) {
          const { method, url, data } = action.payload;
          result = await apiClient.request({
            method,
            url,
            data,
          });
        } else {
          console.warn(`No API handler for action: ${actionType}`);
          return next(action);
        }
    }

    // Dispatch fulfilled action
    store.dispatch({
      type: `${actionType}Fulfilled`,
      payload: result,
      meta: action.meta,
    });

    // Always call next(action) to propagate through middleware chain
    // The original action is consumed, but we dispatch pending/fulfilled/rejected actions
    // which will be handled by reducers
    return next(action);
  } catch (error: any) {
    // Dispatch rejected action
    store.dispatch({
      type: `${actionType}Rejected`,
      payload: {
        message: error.message || 'An error occurred',
        status: error.status,
        data: error.data,
      },
      error: true,
      meta: action.meta,
    });

    // Always call next(action) even on error to maintain middleware chain
    return next(action);
  }
};
