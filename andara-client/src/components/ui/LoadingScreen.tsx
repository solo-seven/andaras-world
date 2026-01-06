import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  progress: number;
  currentAsset?: string;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  currentAsset,
  message = 'Loading assets...',
}) => {
  const percentage = Math.round(progress * 100);

  return (
    <div className="loading-screen">
      <div className="loading-screen__content">
        <h1 className="loading-screen__title">Andara's World</h1>
        <p className="loading-screen__message">{message}</p>

        <div className="loading-screen__progress-container">
          <div className="loading-screen__progress-bar">
            <div
              className="loading-screen__progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="loading-screen__progress-text">{percentage}%</div>
        </div>

        {currentAsset && (
          <p className="loading-screen__current-asset">
            Loading: {currentAsset}
          </p>
        )}

        <div className="loading-screen__rift-energy">
          <div className="loading-screen__energy-pulse" />
        </div>
      </div>
    </div>
  );
};
