import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  instanceId: string | null;
  partyId: string | null;
  sessionId: string | null;
  status: 'menu' | 'loading' | 'playing' | 'paused' | 'combat';
  worldTime: number;
}

const initialState: GameState = {
  instanceId: null,
  partyId: null,
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
    setPartyId: (state, action: PayloadAction<string>) => {
      state.partyId = action.payload;
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
    setGameIds: (
      state,
      action: PayloadAction<{
        instanceId: string;
        partyId: string;
      }>
    ) => {
      state.instanceId = action.payload.instanceId;
      state.partyId = action.payload.partyId;
    },
  },
});

export const {
  setInstanceId,
  setPartyId,
  setSessionId,
  setStatus,
  setWorldTime,
  setGameIds,
} = gameSlice.actions;
export default gameSlice.reducer;


