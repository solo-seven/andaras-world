import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { CharacterSheet } from './CharacterSheet';
import characterCreationReducer from '../../store/slices/characterCreationSlice';
import gameReducer from '../../store/slices/gameSlice';

// Mock the API
vi.mock('../../api/characterApi', () => ({
  getCharacterById: vi.fn(() =>
    Promise.resolve({
      characterId: 'test-id',
      name: 'Test Character',
      origin: 'VAULT_DWELLER',
      attributes: {
        strength: 10,
        agility: 10,
        endurance: 10,
        intellect: 10,
        perception: 10,
        charisma: 10,
      },
      skills: {},
      health: { current: 100, max: 100 },
      status: 'active',
    })
  ),
}));

describe('CharacterSheet', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        characterCreation: characterCreationReducer,
        game: gameReducer,
      },
    });
  });

  it('renders loading state initially', () => {
    // Set up store with characterId so it doesn't immediately error
    store.dispatch({
      type: 'characterCreation/setCreatedCharacterId',
      payload: 'test-id',
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CharacterSheet />
        </MemoryRouter>
      </Provider>
    );

    // Should show loading state initially before API call completes
    expect(screen.getByText(/loading character/i)).toBeInTheDocument();
  });

  it('displays character data after loading', async () => {
    // Pre-populate createdCharacterId
    store.dispatch({
      type: 'characterCreation/setCreatedCharacterId',
      payload: 'test-id',
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CharacterSheet />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/character sheet/i)).toBeInTheDocument();
    });
  });

  it('shows return to menu button', async () => {
    store.dispatch({
      type: 'characterCreation/setCreatedCharacterId',
      payload: 'test-id',
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CharacterSheet />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /return to main menu/i })
      ).toBeInTheDocument();
    });
  });
});
