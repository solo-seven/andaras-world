import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import partyReducer from './slices/partySlice';
import worldReducer from './slices/worldSlice';
import combatReducer from './slices/combatSlice';
import uiReducer from './slices/uiSlice';
import characterCreationReducer from './slices/characterCreationSlice';
import { apiMiddleware } from './middleware/apiMiddleware';
import { websocketMiddleware } from './middleware/websocketMiddleware';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    party: partyReducer,
    world: worldReducer,
    combat: combatReducer,
    ui: uiReducer,
    characterCreation: characterCreationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore paths with non-serializable values (WebSocket, etc.)
        ignoredActions: ['websocket/connectionStateChanged', 'api/webSocketMessage'],
        ignoredPaths: ['websocket'],
      },
    }).concat(apiMiddleware, websocketMiddleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


