import React from 'react';
import './TipsPanel.css';

export interface TipsPanelProps {
  tips?: string[];
}

const DEFAULT_TIPS = [
  'Wastelanders benefit from high END and PER for survival',
  '16+ in any attribute grants special bonuses',
  'Balanced builds are viable, but specialization is powerful',
  'Low CHA makes trading more expensive but doesn\'t lock content',
];

export const TipsPanel: React.FC<TipsPanelProps> = ({ tips = DEFAULT_TIPS }) => {
  return (
    <div className="andara-tips-panel">
      <div className="andara-tips-panel__title">Build Tips</div>
      <div className="andara-tips-panel__list">
        {tips.map((tip, index) => (
          <div key={index} className="andara-tips-panel__tip">
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
};


