import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PartyState {
  partyId: string | null;
  members: Record<string, unknown>;
  position: {
    regionId: string | null;
    zoneId: string | null;
  };
  inventory: unknown;
  formation: string;
  factionStandings: Record<string, number>;
}

const initialState: PartyState = {
  partyId: null,
  members: {},
  position: {
    regionId: null,
    zoneId: null,
  },
  inventory: null,
  formation: 'default',
  factionStandings: {},
};

const partySlice = createSlice({
  name: 'party',
  initialState,
  reducers: {
    setPartyId: (state, action: PayloadAction<string>) => {
      state.partyId = action.payload;
    },
    // Additional reducers will be added as needed
  },
});

export const { setPartyId } = partySlice.actions;
export default partySlice.reducer;


