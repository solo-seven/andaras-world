import React from 'react';
import './OriginCard.css';

export interface OriginStat {
  label: string;
  value: string;
  type?: 'positive' | 'negative' | 'neutral';
}

export interface OriginCardData {
  id: string;
  displayName: string;
  description: string;
  icon: string;
  stats: OriginStat[];
}

export interface OriginCardProps {
  origin: OriginCardData;
  selected?: boolean;
  onClick: () => void;
}

export const OriginCard: React.FC<OriginCardProps> = ({
  origin,
  selected = false,
  onClick,
}) => {
  return (
    <div
      className={`andara-origin-card ${selected ? 'andara-origin-card--selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={selected}
      aria-label={`Select ${origin.displayName} origin`}
    >
      {selected && (
        <>
          <div className="corner-bracket corner-bracket--top-left" />
          <div className="corner-bracket corner-bracket--top-right" />
          <div className="corner-bracket corner-bracket--bottom-left" />
          <div className="corner-bracket corner-bracket--bottom-right" />
        </>
      )}
      <div
        className="andara-origin-card__image"
        data-origin={origin.id.toLowerCase().replace(/_/g, '-')}
      >
        <span className="andara-origin-card__icon">{origin.icon}</span>
      </div>
      <div className="andara-origin-card__content">
        <h3 className="andara-origin-card__name">{origin.displayName}</h3>
        <p className="andara-origin-card__description">{origin.description}</p>
        <div className="andara-origin-card__stats">
          {origin.stats.map((stat, index) => (
            <div key={index} className="andara-origin-card__stat-item">
              <span className="andara-origin-card__stat-label">{stat.label}:</span>
              <span
                className={`andara-origin-card__stat-value ${
                  stat.type === 'positive'
                    ? 'andara-origin-card__stat-value--positive'
                    : stat.type === 'negative'
                      ? 'andara-origin-card__stat-value--negative'
                      : ''
                }`}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

