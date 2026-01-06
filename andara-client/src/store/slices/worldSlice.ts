import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Zone data structure matching backend format
export interface ZoneData {
  id: string;
  width: number;
  height: number;
  tiles: Array<Array<{ terrain: string; variant: number; discovered: boolean }>>;
  // Add other zone properties as needed
}

interface WorldState {
  currentRegion: unknown | null;
  currentZone: ZoneData | null;
  zones: Record<string, ZoneData>;
  discoveredPOIs: Record<string, unknown>;
  visibilityMap: Record<string, string>;
}

const initialState: WorldState = {
  currentRegion: null,
  currentZone: null,
  zones: {},
  discoveredPOIs: {},
  visibilityMap: {},
};

const worldSlice = createSlice({
  name: 'world',
  initialState,
  reducers: {
    updateZone: (state, action: PayloadAction<ZoneData>) => {
      state.currentZone = action.payload;
      state.zones[action.payload.id] = action.payload;
    },
    // Additional reducers will be added as needed
  },
});

export const { updateZone } = worldSlice.actions;
export default worldSlice.reducer;

