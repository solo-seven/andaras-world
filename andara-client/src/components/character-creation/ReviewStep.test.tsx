import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ReviewStep } from './ReviewStep';
import characterCreationReducer from '../../store/slices/characterCreationSlice';
import gameReducer from '../../store/slices/gameSlice';
import { Origin } from '../../types/character';

// Mock the API
vi.mock('../../api/characterApi', () => ({
  createCharacter: vi.fn(() => Promise.resolve({ characterId: 'test-id' })),
}));

describe('ReviewStep', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        characterCreation: characterCreationReducer,
        game: gameReducer,
      },
    });
  });

  it('renders review step with summary', () => {
    // Pre-populate store with character data
    store.dispatch({
      type: 'characterCreation/updateFormData',
      payload: {
        name: 'Test Character',
        origin: Origin.VAULT_DWELLER,
        attributes: {
          strength: 10,
          agility: 10,
          endurance: 10,
          intellect: 10,
          perception: 10,
          charisma: 10,
        },
        skillFocuses: ['skill1', 'skill2'],
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ReviewStep />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('heading', { name: /review your character/i })).toBeInTheDocument();
  });

  it('disables Create Character button when data is incomplete', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ReviewStep />
        </MemoryRouter>
      </Provider>
    );

    const createButton = screen.getByRole('button', { name: /create character/i });
    expect(createButton).toBeDisabled();
  });
});
