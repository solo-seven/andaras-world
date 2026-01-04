import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { LandingPage } from './LandingPage';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LandingPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  it('renders the game title', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Andara's World")).toBeInTheDocument();
  });

  it('renders New Game button', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    const newGameButton = screen.getByRole('button', { name: /new game/i });
    expect(newGameButton).toBeInTheDocument();
    expect(newGameButton).not.toBeDisabled();
  });

  it('renders Load Game button as disabled', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    const loadGameButton = screen.getByRole('button', { name: /load game/i });
    expect(loadGameButton).toBeInTheDocument();
    expect(loadGameButton).toBeDisabled();
  });

  it('navigates to character creation when New Game is clicked', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    
    const newGameButton = screen.getByRole('button', { name: /new game/i });
    fireEvent.click(newGameButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/character-creation');
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    
    const landingPage = container.firstChild as HTMLElement;
    expect(landingPage).toHaveClass('landing-page');
  });

  it('has title with Rajdhani font class', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    const title = screen.getByText("Andara's World");
    expect(title).toHaveClass('landing-page__title');
  });
});
