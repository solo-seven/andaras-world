import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { NameStep } from './NameStep';
import characterCreationReducer from '../../store/slices/characterCreationSlice';
import gameReducer from '../../store/slices/gameSlice';

describe('NameStep', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        characterCreation: characterCreationReducer,
        game: gameReducer,
      },
    });
  });

  it('renders name input step', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <NameStep />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/name your character/i)).toBeInTheDocument();
  });

  it('validates name length minimum', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <NameStep />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/enter character name/i);
    fireEvent.change(input, { target: { value: 'A' } });
    
    // Button should be disabled for invalid input (length < 2)
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('validates name length maximum', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <NameStep />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/enter character name/i);
    fireEvent.change(input, { target: { value: 'A'.repeat(31) } });
    
    // Button should be disabled for invalid input (length > 30)
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('validates name format (alphanumeric + spaces/apostrophes/hyphens)', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <NameStep />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/enter character name/i);
    fireEvent.change(input, { target: { value: 'Test@Name' } });
    
    // Button should be disabled for invalid format (contains @)
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('accepts valid names with apostrophes and hyphens', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <NameStep />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/enter character name/i);
    const nextButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(input, { target: { value: "O'Brien-Smith" } });
    fireEvent.click(nextButton);

    // Should not show error for valid name
    expect(screen.queryByText(/name can only contain/i)).not.toBeInTheDocument();
  });
});
