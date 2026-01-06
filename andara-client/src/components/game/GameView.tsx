import React, { useState } from 'react';
import { GameCanvas } from '../../game/renderer/GameCanvas';
import { PartyPanel } from './PartyPanel';
import { NotificationBar } from './NotificationBar';
import { ResourceBar } from './ResourceBar';
import { ActionBar } from './ActionBar';
import './GameView.css';

export const GameView: React.FC = () => {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <div className="game-view">
      <div className="game-view__top-bar">
        <ResourceBar />
      </div>

      <div className="game-view__main-content">
        <div className="game-view__canvas-container">
          <GameCanvas />
          <ActionBar />
        </div>

        {rightPanelOpen && (
          <div className="game-view__right-sidebar">
            <PartyPanel />
          </div>
        )}
      </div>

      <div className="game-view__bottom-bar">
        <NotificationBar />
      </div>

      <button
        className={`game-view__panel-toggle ${rightPanelOpen ? 'game-view__panel-toggle--sidebar-open' : 'game-view__panel-toggle--sidebar-closed'}`}
        onClick={() => setRightPanelOpen(!rightPanelOpen)}
        aria-label={rightPanelOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {rightPanelOpen ? '»' : '«'}
      </button>
    </div>
  );
};
