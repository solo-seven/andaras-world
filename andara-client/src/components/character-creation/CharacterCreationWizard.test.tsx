import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { CharacterCreationWizard } from './CharacterCreationWizard';
import characterCreationReducer from '../../store/slices/characterCreationSlice';
import gameReducer from '../../store/slices/gameSlice';

// Mock the API
vi.mock('../../api/characterApi', () => ({
  getOrigins: vi.fn(() => Promise.resolve([])),
  getSkills: vi.fn(() => Promise.resolve([])),
}));

describe('CharacterCreationWizard', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        characterCreation: characterCreationReducer,
        game: gameReducer,
      },
    });
  });

  it('renders the wizard with stepper', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CharacterCreationWizard />
        </MemoryRouter>
      </Provider>
    );

    // Wait for data to load, then check for Origin step label
    await waitFor(() => {
      const originLabels = screen.getAllByText('Origin');
      expect(originLabels.length).toBeGreaterThan(0);
    });
  });

  it('displays the correct step component based on currentStep', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CharacterCreationWizard />
        </MemoryRouter>
      </Provider>
    );

    // Should show origin step initially
    await waitFor(() => {
      expect(screen.getByText(/choose your origin/i)).toBeInTheDocument();
    });
  });
});
