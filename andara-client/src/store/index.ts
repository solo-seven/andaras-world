import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import partyReducer from './slices/partySlice';
import worldReducer from './slices/worldSlice';
import combatReducer from './slices/combatSlice';
import uiReducer from './slices/uiSlice';
import characterCreationReducer from './slices/characterCreationSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    party: partyReducer,
    world: worldReducer,
    combat: combatReducer,
    ui: uiReducer,
    characterCreation: characterCreationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

