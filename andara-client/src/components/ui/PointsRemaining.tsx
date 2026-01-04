import React from 'react';
import './PointsRemaining.css';

export interface PointsRemainingProps {
  points: number;
}

export const PointsRemaining: React.FC<PointsRemainingProps> = ({ points }) => {
  return (
    <div className="andara-points-remaining">
      <span className="andara-points-remaining__number">{points}</span>{' '}
      <span className="andara-points-remaining__label">points remaining</span>
    </div>
  );
};


