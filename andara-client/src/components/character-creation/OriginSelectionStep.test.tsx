import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { OriginSelectionStep } from './OriginSelectionStep';
import characterCreationReducer, { setOrigins } from '../../store/slices/characterCreationSlice';
import gameReducer from '../../store/slices/gameSlice';
import { Origin } from '../../types/character';

describe('OriginSelectionStep', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        characterCreation: characterCreationReducer,
        game: gameReducer,
      },
    });

    // Pre-populate origins in store since OriginSelectionStep doesn't load them
    store.dispatch(setOrigins([
      {
        id: Origin.VAULT_DWELLER,
        displayName: 'Vault Dweller',
        description: 'Test description',
        bonuses: ['Tech skills'],
        stats: [],
        penalties: [],
        startingGear: undefined,
        factionRelationships: {},
        specialAbilities: [],
        icon: '🏠',
      },
      {
        id: Origin.WASTELANDER,
        displayName: 'Wastelander',
        description: 'Test description',
        bonuses: ['Survival skills'],
        stats: [],
        penalties: [],
        startingGear: undefined,
        factionRelationships: {},
        specialAbilities: [],
        icon: '🏜️',
      },
    ]));
  });

  it('renders origin selection step', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <OriginSelectionStep />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/choose your origin/i)).toBeInTheDocument();
  });

  it('displays origin cards in grid', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <OriginSelectionStep />
        </MemoryRouter>
      </Provider>
    );

    // Origins are pre-populated in store, should render immediately
    expect(screen.getByText('Vault Dweller')).toBeInTheDocument();
    expect(screen.getByText('Wastelander')).toBeInTheDocument();
  });

  it('enables Next button when origin is selected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <OriginSelectionStep />
        </MemoryRouter>
      </Provider>
    );

    // Origins are pre-populated, find the card by aria-label
    const vaultDwellerCard = screen.getByLabelText('Select Vault Dweller origin');
    fireEvent.click(vaultDwellerCard);

    const nextButton = screen.getByRole('button', { name: /continue/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('disables Next button when no origin is selected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <OriginSelectionStep />
        </MemoryRouter>
      </Provider>
    );

    // Origins are pre-populated, should render immediately
    expect(screen.getByText('Vault Dweller')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /continue/i });
    expect(nextButton).toBeDisabled();
  });
});
