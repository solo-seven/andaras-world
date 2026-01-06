import React from 'react';
import { useAppSelector } from '../../store/hooks';
import './ResourceBar.css';

export const ResourceBar: React.FC = () => {
  const worldTime = useAppSelector((state) => state.game.worldTime);
  const gameStatus = useAppSelector((state) => state.game.status);

  // Calculate time of day from world time (assuming 24-hour cycle)
  const hour = Math.floor(worldTime % 24);
  const day = Math.floor(worldTime / 24) + 1;
  const timeOfDay = formatTimeOfDay(hour);

  // Mock credits - will be replaced with actual resource data
  const credits = 0;

  return (
    <div className="resource-bar">
      <div className="resource-bar__item">
        <span className="resource-bar__label">Credits:</span>
        <span className="resource-bar__value">{credits.toLocaleString()}</span>
      </div>
      <div className="resource-bar__item">
        <span className="resource-bar__label">Day:</span>
        <span className="resource-bar__value">{day}</span>
      </div>
      <div className="resource-bar__item">
        <span className="resource-bar__label">Time:</span>
        <span className="resource-bar__value">{timeOfDay}</span>
      </div>
      {gameStatus === 'combat' && (
        <div className="resource-bar__item resource-bar__item--combat">
          <span className="resource-bar__label">Combat</span>
        </div>
      )}
    </div>
  );
};

function formatTimeOfDay(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}
