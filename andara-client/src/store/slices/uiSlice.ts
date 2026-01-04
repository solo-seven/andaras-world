import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  selectedCharacter: string | null;
  selectedTarget: string | null;
  openPanels: string[];
  notifications: unknown[];
  modalStack: unknown[];
}

const initialState: UiState = {
  selectedCharacter: null,
  selectedTarget: null,
  openPanels: [],
  notifications: [],
  modalStack: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedCharacter: (state, action: PayloadAction<string | null>) => {
      state.selectedCharacter = action.payload;
    },
    // Additional reducers will be added as needed
  },
});

export const { setSelectedCharacter } = uiSlice.actions;
export default uiSlice.reducer;


