import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSelectedCharacter } from '../../store/slices/uiSlice';
import { Panel, PanelHeader, PanelBody } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';
import './PartyPanel.css';

export const PartyPanel: React.FC = () => {
  const party = useAppSelector((state) => state.party);
  const selectedCharacterId = useAppSelector((state) => state.ui.selectedCharacter);
  const dispatch = useAppDispatch();

  const handleCharacterClick = (characterId: string) => {
    dispatch(setSelectedCharacter(characterId));
  };

  // Mock data structure - will be replaced with actual party data
  const partyMembers = Object.entries(party.members).map(([id, member]: [string, any]) => ({
    id,
    name: member.name || 'Unknown',
    health: member.health || 100,
    maxHealth: member.maxHealth || 100,
    stamina: member.stamina || 100,
    maxStamina: member.maxStamina || 100,
  }));

  return (
    <Panel className="party-panel">
      <PanelHeader>Party</PanelHeader>
      <PanelBody>
        {partyMembers.length === 0 ? (
          <div className="party-panel__empty">No party members</div>
        ) : (
          partyMembers.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              selected={character.id === selectedCharacterId}
              onClick={() => handleCharacterClick(character.id)}
            />
          ))
        )}
      </PanelBody>
    </Panel>
  );
};

interface CharacterCardProps {
  character: {
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
  };
  selected: boolean;
  onClick: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  selected,
  onClick,
}) => {
  return (
    <div
      className={`party-panel__character-card ${selected ? 'party-panel__character-card--selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Select ${character.name}`}
    >
      <div className="party-panel__character-header">
        <div className="party-panel__character-portrait">
          {/* Placeholder for character portrait */}
        </div>
        <div className="party-panel__character-name">{character.name}</div>
      </div>
      <div className="party-panel__character-stats">
        <ProgressBar
          value={character.health}
          max={character.maxHealth}
          variant="health"
          showValue
          aria-label={`${character.name} health: ${character.health} of ${character.maxHealth}`}
        />
        <ProgressBar
          value={character.stamina}
          max={character.maxStamina}
          variant="stamina"
          showValue
          aria-label={`${character.name} stamina: ${character.stamina} of ${character.maxStamina}`}
        />
      </div>
    </div>
  );
};
