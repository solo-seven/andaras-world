import React from 'react';
import type { Attributes } from '../../types/character';
import './DerivedStatsPanel.css';

export interface DerivedStatsPanelProps {
  attributes: Attributes;
}

export interface DerivedStats {
  maxHealth: number;
  maxStamina: number;
  carryWeight: number;
  initiative: number;
  baseActionPoints: number;
  critChance: number;
}

export function calculateDerivedStats(attributes: Attributes): DerivedStats {
  return {
    maxHealth: 50 + attributes.endurance * 10,
    maxStamina: 40 + attributes.endurance * 8 + attributes.agility * 3,
    carryWeight: 50 + attributes.strength * 6,
    initiative: Math.floor(attributes.agility / 3),
    baseActionPoints: 3,
    critChance: 5 + Math.floor(attributes.perception / 4),
  };
}

export const DerivedStatsPanel: React.FC<DerivedStatsPanelProps> = ({
  attributes,
}) => {
  const stats = calculateDerivedStats(attributes);

  return (
    <div className="andara-derived-stats-panel">
      <div className="andara-derived-stats-panel__title">
        Derived Statistics
      </div>
      <div className="andara-derived-stats-panel__list">
        <div className="andara-derived-stats-panel__stat">
          <span className="andara-derived-stats-panel__label">Max Health</span>
          <span className="andara-derived-stats-panel__value">{stats.maxHealth}</span>
        </div>
        <div className="andara-derived-stats-panel__stat">
          <span className="andara-derived-stats-panel__label">Max Stamina</span>
          <span className="andara-derived-stats-panel__value">{stats.maxStamina}</span>
        </div>
        <div className="andara-derived-stats-panel__stat">
          <span className="andara-derived-stats-panel__label">Carry Weight</span>
          <span className="andara-derived-stats-panel__value">{stats.carryWeight} kg</span>
        </div>
        <div className="andara-derived-stats-panel__stat">
          <span className="andara-derived-stats-panel__label">Initiative Bonus</span>
          <span className="andara-derived-stats-panel__value">+{stats.initiative}</span>
        </div>
        <div className="andara-derived-stats-panel__stat">
          <span className="andara-derived-stats-panel__label">Base Action Points</span>
          <span className="andara-derived-stats-panel__value">{stats.baseActionPoints} AP</span>
        </div>
        <div className="andara-derived-stats-panel__stat">
          <span className="andara-derived-stats-panel__label">Critical Chance</span>
          <span className="andara-derived-stats-panel__value">{stats.critChance}%</span>
        </div>
      </div>
    </div>
  );
};


