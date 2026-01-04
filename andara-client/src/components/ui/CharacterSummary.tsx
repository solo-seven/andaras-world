import React from 'react';
import type { Origin, Attributes, Appearance } from '../../types/character';
import './CharacterSummary.css';

export interface CharacterSummaryProps {
  name: string;
  origin: Origin | null;
  attributes: Attributes | null;
  skills: string[]; // Skill IDs
  appearance: Appearance | null;
  availableSkills?: Array<{ id: string; name: string; category: string }>;
  availableOrigins?: Array<{ id: string; displayName: string }>;
}

export const CharacterSummary: React.FC<CharacterSummaryProps> = ({
  name,
  origin,
  attributes,
  skills,
  appearance,
  availableSkills = [],
  availableOrigins = [],
}) => {
  const getOriginName = (originId: Origin | null): string => {
    if (!originId) return 'Not selected';
    const originDef = availableOrigins.find((o) => o.id === originId);
    return originDef?.displayName || originId.replace(/_/g, ' ');
  };

  const getSkillName = (skillId: string): string => {
    const skill = availableSkills.find((s) => s.id === skillId);
    return skill?.name || skillId;
  };

  return (
    <div className="character-summary">
      <div className="character-summary__section">
        <h3 className="character-summary__section-title">Basic Information</h3>
        <div className="character-summary__field">
          <span className="character-summary__field-label">Name:</span>
          <span className="character-summary__field-value">{name || 'Not set'}</span>
        </div>
        <div className="character-summary__field">
          <span className="character-summary__field-label">Origin:</span>
          <span className="character-summary__field-value">{getOriginName(origin)}</span>
        </div>
      </div>

      {attributes && (
        <div className="character-summary__section">
          <h3 className="character-summary__section-title">Attributes</h3>
          <div className="character-summary__attributes-grid">
            <div className="character-summary__attribute">
              <span className="character-summary__attribute-label">STR</span>
              <span className="character-summary__attribute-value">
                {attributes.strength}
              </span>
            </div>
            <div className="character-summary__attribute">
              <span className="character-summary__attribute-label">AGI</span>
              <span className="character-summary__attribute-value">
                {attributes.agility}
              </span>
            </div>
            <div className="character-summary__attribute">
              <span className="character-summary__attribute-label">END</span>
              <span className="character-summary__attribute-value">
                {attributes.endurance}
              </span>
            </div>
            <div className="character-summary__attribute">
              <span className="character-summary__attribute-label">INT</span>
              <span className="character-summary__attribute-value">
                {attributes.intellect}
              </span>
            </div>
            <div className="character-summary__attribute">
              <span className="character-summary__attribute-label">PER</span>
              <span className="character-summary__attribute-value">
                {attributes.perception}
              </span>
            </div>
            <div className="character-summary__attribute">
              <span className="character-summary__attribute-label">CHA</span>
              <span className="character-summary__attribute-value">
                {attributes.charisma}
              </span>
            </div>
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="character-summary__section">
          <h3 className="character-summary__section-title">Focus Skills</h3>
          <ul className="character-summary__skills-list">
            {skills.map((skillId) => (
              <li key={skillId} className="character-summary__skill-item">
                {getSkillName(skillId)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {appearance && (
        <div className="character-summary__section">
          <h3 className="character-summary__section-title">Appearance</h3>
          <div className="character-summary__appearance-fields">
            <div className="character-summary__field">
              <span className="character-summary__field-label">Body Type:</span>
              <span className="character-summary__field-value">
                {appearance.bodyType.replace('_', '-')}
              </span>
            </div>
            <div className="character-summary__field">
              <span className="character-summary__field-label">Hair:</span>
              <span className="character-summary__field-value">
                {appearance.hairStyle.replace('_', '-')} ({appearance.hairColor})
              </span>
            </div>
            <div className="character-summary__field">
              <span className="character-summary__field-label">Eyes:</span>
              <span className="character-summary__field-value">
                {appearance.eyeColor}
              </span>
            </div>
            <div className="character-summary__field">
              <span className="character-summary__field-label">Skin:</span>
              <span className="character-summary__field-value">
                {appearance.skinTone}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
