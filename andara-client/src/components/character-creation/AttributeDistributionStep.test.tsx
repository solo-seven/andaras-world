import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AttributeDistributionStep } from './AttributeDistributionStep';
import characterCreationReducer from '../../store/slices/characterCreationSlice';
import gameReducer from '../../store/slices/gameSlice';

describe('AttributeDistributionStep', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        characterCreation: characterCreationReducer,
        game: gameReducer,
      },
    });
  });

  it('renders attribute distribution step', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AttributeDistributionStep />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/distribute attributes/i)).toBeInTheDocument();
  });

  it('displays all six attributes', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AttributeDistributionStep />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/strength/i)).toBeInTheDocument();
    expect(screen.getByText(/agility/i)).toBeInTheDocument();
    expect(screen.getByText(/endurance/i)).toBeInTheDocument();
    expect(screen.getByText(/intellect/i)).toBeInTheDocument();
    expect(screen.getByText(/perception/i)).toBeInTheDocument();
    expect(screen.getByText(/charisma/i)).toBeInTheDocument();
  });

  it('shows remaining points display', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AttributeDistributionStep />
        </MemoryRouter>
      </Provider>
    );

    // Should show 27 points remaining initially - use getAllByText and check one exists
    const pointsElements = screen.getAllByText(/27/i);
    expect(pointsElements.length).toBeGreaterThan(0);
  });

  it('has reset button', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AttributeDistributionStep />
        </MemoryRouter>
      </Provider>
    );

    const resetButton = screen.getByRole('button', { name: /reset/i });
    expect(resetButton).toBeInTheDocument();
  });

  it('disables Next button when points remain', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AttributeDistributionStep />
        </MemoryRouter>
      </Provider>
    );

    const nextButton = screen.getByRole('button', { name: /continue/i });
    expect(nextButton).toBeDisabled();
  });
});
