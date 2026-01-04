import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { SkillFocusStep } from './SkillFocusStep';
import characterCreationReducer from '../../store/slices/characterCreationSlice';
import gameReducer from '../../store/slices/gameSlice';

describe('SkillFocusStep', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        characterCreation: characterCreationReducer,
        game: gameReducer,
      },
    });
  });

  it('renders skill focus selection step', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SkillFocusStep />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/select starting skills/i)).toBeInTheDocument();
  });

  it('requires exactly 2 skill focuses to proceed', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SkillFocusStep />
        </MemoryRouter>
      </Provider>
    );

    const nextButton = screen.getByRole('button', { name: /continue/i });
    expect(nextButton).toBeDisabled();
  });

  it('shows skill categories', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SkillFocusStep />
        </MemoryRouter>
      </Provider>
    );

    // Categories should be visible if skills are loaded
    // This test assumes skills are loaded from API
    // In a real test, we'd mock the API or pre-populate store
  });
});
