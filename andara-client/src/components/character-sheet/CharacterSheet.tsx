import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { getCharacterById } from '../../api/characterApi';
import { CharacterSummary } from '../ui/CharacterSummary';
import { Button } from '../ui/Button';
import { ErrorBanner } from '../ui/ErrorBanner';
import './CharacterSheet.css';

interface CharacterData {
  characterId: string;
  name: string;
  origin: string;
  attributes: Record<string, number>;
  skills: Record<string, number>;
  appearance: Record<string, unknown> | null;
  health: {
    current: number;
    max: number;
  };
  status: string;
}

export const CharacterSheet: React.FC = () => {
  const navigate = useNavigate();
  const { characterId } = useParams<{ characterId: string }>();
  const { createdCharacterId } = useAppSelector(
    (state) => state.characterCreation
  );

  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use characterId from params, or fall back to createdCharacterId from Redux
  const effectiveCharacterId = characterId || createdCharacterId;

  useEffect(() => {
    if (!effectiveCharacterId) {
      setError('No character ID provided');
      setLoading(false);
      return;
    }

    const fetchCharacter = async () => {
      try {
        setLoading(true);
        setError(null);
        const characterData = await getCharacterById(effectiveCharacterId);
        setCharacter(characterData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load character'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [effectiveCharacterId]);

  const handleBeginAdventure = () => {
    // Placeholder - future implementation
    console.log('Begin Adventure clicked');
  };

  const handleReturnToMenu = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="character-sheet">
        <div className="character-sheet__loading">Loading character...</div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="character-sheet">
        <ErrorBanner message={error || 'Character not found'} />
        <Button variant="secondary" onClick={handleReturnToMenu}>
          Return to Main Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="character-sheet">
      <header className="character-sheet__header">
        <h1 className="character-sheet__title">Character Sheet</h1>
      </header>

      <main className="character-sheet__main">
        <CharacterSummary
          name={character.name}
          origin={character.origin as any}
          attributes={{
            strength: character.attributes.strength || 0,
            agility: character.attributes.agility || 0,
            endurance: character.attributes.endurance || 0,
            intellect: character.attributes.intellect || 0,
            perception: character.attributes.perception || 0,
            charisma: character.attributes.charisma || 0,
          }}
          skills={Object.keys(character.skills || {})}
          appearance={null} // Appearance data structure may differ
          availableOrigins={[]}
          availableSkills={[]}
        />

        <div className="character-sheet__health">
          <div className="character-sheet__health-label">Health</div>
          <div className="character-sheet__health-bar">
            <div
              className="character-sheet__health-fill"
              style={{
                width: `${(character.health.current / character.health.max) * 100}%`,
              }}
            />
          </div>
          <div className="character-sheet__health-value">
            {character.health.current} / {character.health.max}
          </div>
        </div>
      </main>

      <footer className="character-sheet__actions">
        <Button variant="secondary" onClick={handleReturnToMenu}>
          Return to Main Menu
        </Button>
        <Button variant="primary" onClick={handleBeginAdventure} disabled>
          Begin Adventure
        </Button>
      </footer>
    </div>
  );
};
