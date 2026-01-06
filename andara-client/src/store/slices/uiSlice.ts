import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp?: number;
}

interface UiState {
  selectedCharacter: string | null;
  selectedTarget: string | null;
  openPanels: string[];
  notifications: Notification[];
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
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification: Notification = {
        ...action.payload,
        id: action.payload.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: action.payload.timestamp || Date.now(),
      };
      state.notifications.push(notification);
      // Keep only the last 50 notifications to prevent memory issues
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(-50);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    // Additional reducers will be added as needed
  },
});

export const {
  setSelectedCharacter,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;
export default uiSlice.reducer;


