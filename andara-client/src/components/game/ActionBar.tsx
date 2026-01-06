import React from 'react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import './ActionBar.css';

interface Action {
  id: string;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

export const ActionBar: React.FC = () => {
  // Mock actions - will be replaced with context-sensitive actions
  const actions: Action[] = [
    {
      id: 'inventory',
      label: 'I',
      shortcut: 'I',
      onClick: () => console.log('Open inventory'),
      tooltip: 'Open Inventory (I)',
    },
    {
      id: 'character',
      label: 'C',
      shortcut: 'C',
      onClick: () => console.log('Open character sheet'),
      tooltip: 'Character Sheet (C)',
    },
    {
      id: 'map',
      label: 'M',
      shortcut: 'M',
      onClick: () => console.log('Open map'),
      tooltip: 'Map (M)',
    },
  ];

  return (
    <div className="action-bar">
      {actions.map((action) => {
        const button = (
          <Button
            variant="ghost"
            onClick={action.onClick}
            disabled={action.disabled}
            aria-label={action.tooltip || action.label}
          >
            {action.label}
          </Button>
        );

        // Key must be on the top-level element returned from map
        return action.tooltip ? (
          <Tooltip key={action.id} content={action.tooltip} position="top">
            {button}
          </Tooltip>
        ) : (
          <React.Fragment key={action.id}>{button}</React.Fragment>
        );
      })}
    </div>
  );
};
