import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  instanceId: string | null;
  sessionId: string | null;
  status: 'menu' | 'loading' | 'playing' | 'paused' | 'combat';
  worldTime: number;
}

const initialState: GameState = {
  instanceId: null,
  sessionId: null,
  status: 'menu',
  worldTime: 0,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setInstanceId: (state, action: PayloadAction<string>) => {
      state.instanceId = action.payload;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    setStatus: (state, action: PayloadAction<GameState['status']>) => {
      state.status = action.payload;
    },
    setWorldTime: (state, action: PayloadAction<number>) => {
      state.worldTime = action.payload;
    },
  },
});

export const { setInstanceId, setSessionId, setStatus, setWorldTime } = gameSlice.actions;
export default gameSlice.reducer;


