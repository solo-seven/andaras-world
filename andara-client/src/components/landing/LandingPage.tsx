import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNewGame = () => {
    navigate('/character-creation');
  };

  return (
    <div className="landing-page">
      <div className="landing-page__content">
        <h1 className="landing-page__title">Andara&apos;s World</h1>
        <div className="landing-page__actions">
          <Button variant="primary" onClick={handleNewGame}>
            New Game
          </Button>
          <Button variant="secondary" disabled>
            Load Game
          </Button>
        </div>
      </div>
    </div>
  );
};
