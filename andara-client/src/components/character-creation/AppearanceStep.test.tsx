import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AppearanceStep } from './AppearanceStep';
import characterCreationReducer from '../../store/slices/characterCreationSlice';
import gameReducer from '../../store/slices/gameSlice';

describe('AppearanceStep', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        characterCreation: characterCreationReducer,
        game: gameReducer,
      },
    });
  });

  it('renders appearance customization step', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppearanceStep />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/customize appearance/i)).toBeInTheDocument();
  });

  it('allows skipping without filling all fields', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppearanceStep />
        </MemoryRouter>
      </Provider>
    );

    const nextButton = screen.getByRole('button', { name: /continue/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('shows character preview placeholder', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppearanceStep />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/character preview/i)).toBeInTheDocument();
  });
});
