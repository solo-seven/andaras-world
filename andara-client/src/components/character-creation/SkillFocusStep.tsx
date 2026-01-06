import React, { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setStep,
  updateFormData,
  setValidationErrors,
} from '../../store/slices/characterCreationSlice';
import { Origin, Skill } from '../../types/character';
import { Button } from '../ui/Button';
import { Stepper, StepperStep } from '../ui/Stepper';
import './SkillFocusStep.css';

const CHARACTER_CREATION_STEPS: StepperStep[] = [
  { id: 'origin', label: 'Origin' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'skills', label: 'Skills' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'name', label: 'Identity' },
];

// Category definitions with icons and descriptions
const SKILL_CATEGORIES = {
  combat: {
    name: 'Combat',
    icon: '⚔',
    description: 'Violent encounters, weapon mastery, tactical positioning',
    color: 'var(--color-combat)',
  },
  survival: {
    name: 'Survival',
    icon: '☘',
    description: 'Endurance, resource gathering, wilderness knowledge',
    color: 'var(--color-survival)',
  },
  technical: {
    name: 'Technical',
    icon: '⚙',
    description: 'Engineering, electronics, chemistry, crafting',
    color: 'var(--color-technical)',
  },
  arcane: {
    name: 'Arcane',
    icon: '◈',
    description: 'Rift energy manipulation, dimensional awareness',
    color: 'var(--color-arcane)',
  },
  social: {
    name: 'Social',
    icon: '⚖',
    description: 'Influence, negotiation, deception, leadership',
    color: 'var(--color-social)',
  },
} as const;

// Map origin to skills that get bonus (start at 15)
const ORIGIN_SKILL_BONUSES: Record<Origin, string[]> = {
  [Origin.VAULT_DWELLER]: [], // Tech skills are general, not specific
  [Origin.WASTELANDER]: ['tracking', 'scavenging'], // +Survival skills, +Scavenging
  [Origin.RIFT_TOUCHED]: [], // +Arcane skills are general
  [Origin.CARAVAN_GUARD]: ['barter'], // +Barter
  [Origin.SETTLEMENT_MILITIA]: ['ranged'], // +Ranged
  [Origin.OUTCAST]: ['deception'], // +Deception
};

// Helper to normalize skill ID for comparison
const normalizeSkillId = (id: string): string => {
  return id.toLowerCase().replace(/[_-]/g, '');
};

// Helper to get base proficiency for a skill based on origin
const getBaseProficiency = (
  skillId: string,
  origin: Origin | null
): number => {
  if (!origin) return 0;
  const bonusSkills = ORIGIN_SKILL_BONUSES[origin] || [];
  const normalizedSkillId = normalizeSkillId(skillId);
  return bonusSkills.some(
    (id) => normalizeSkillId(id) === normalizedSkillId
  )
    ? 15
    : 0;
};

// Helper to get category color
const getCategoryColor = (category: string): string => {
  const categoryKey = category.toLowerCase() as keyof typeof SKILL_CATEGORIES;
  return SKILL_CATEGORIES[categoryKey]?.color || 'var(--color-smoke)';
};

export const SkillFocusStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availableSkills, formData, validationErrors, currentStep } =
    useAppSelector((state) => state.characterCreation);

  const maxSelections = 2;

  const handleToggleSkill = (skillId: string) => {
    const current = formData.skillFocuses;
    if (current.includes(skillId)) {
      // Deselect
      dispatch(updateFormData({ skillFocuses: current.filter((id: string) => id !== skillId) }));
    } else {
      // Select (if under max)
      if (current.length < maxSelections) {
        dispatch(updateFormData({ skillFocuses: [...current, skillId] }));
      }
    }
    dispatch(setValidationErrors({}));
  };

  const handleNext = () => {
    if (formData.skillFocuses.length !== maxSelections) {
      dispatch(
        setValidationErrors({
          skills: `Please select ${maxSelections} skill focuses to continue`,
        })
      );
      return;
    }
    dispatch(setStep('appearance'));
  };

  const handleBack = () => {
    dispatch(setStep('attributes'));
  };

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, typeof availableSkills> = {};
    availableSkills.forEach((skill: Skill) => {
      const category = skill.category.toLowerCase();
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });
    return grouped;
  }, [availableSkills]);

  // Get selected skills for display (using IDs as stable identifiers)
  const selectedSkills = useMemo(() => {
    return formData.skillFocuses
      .map((skillId: string) => availableSkills.find((s: Skill) => s.id === skillId))
      .filter((skill: Skill | undefined): skill is Skill => !!skill);
  }, [formData.skillFocuses, availableSkills]);

  // Get origin bonus skills for current origin
  const originBonusSkills = useMemo(() => {
    if (!formData.origin) return [];
    return ORIGIN_SKILL_BONUSES[formData.origin as Origin] || [];
  }, [formData.origin]);

  return (
    <div className="andara-skill-focus-step">
      <header className="andara-skill-focus-step__header">
        <div className="andara-skill-focus-step__logo">ANDARA&apos;S WORLD</div>
        <Stepper steps={CHARACTER_CREATION_STEPS} currentStep={currentStep} />
      </header>

      <main className="andara-skill-focus-step__main">
        <h1 className="andara-skill-focus-step__title">
          Select Starting Skills
        </h1>
        <p className="andara-skill-focus-step__subtitle">
          Choose <strong>two skill focuses</strong> to receive elevated starting
          proficiency (20).
          {formData.origin && originBonusSkills.length > 0 && (
            <>
              {' '}
              Your {formData.origin
                .split('_')
                .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
                .join(' ')}{' '}
              origin has already granted you{' '}
              <strong>
                {originBonusSkills
                  .map((id: string) => {
                    const skill = availableSkills.find(
                      (s: Skill) => normalizeSkillId(s.id) === normalizeSkillId(id)
                    );
                    return skill?.name;
                  })
                  .filter(Boolean)
                  .join(', ')}{' '}
                (15)
              </strong>
              .
            </>
          )}{' '}
          Skills improve through use—specialization is powerful, but you can
          develop any skill over time.
        </p>

        {/* Selection Summary */}
        <div className="andara-skill-focus-step__selection-header">
          <div className="andara-skill-focus-step__selection-count">
            <span className="andara-skill-focus-step__selection-number">
              {formData.skillFocuses.length}
            </span>{' '}
            / {maxSelections} focuses selected
          </div>
          <div className="andara-skill-focus-step__selected-skills">
            {selectedSkills.map((skill: Skill) => {
              const categoryColor = getCategoryColor(skill.category);
              return (
                <div
                  key={skill.id}
                  className="andara-skill-focus-step__selected-skill-tag"
                  style={{ borderColor: categoryColor }}
                >
                  {skill.name}
                </div>
              );
            })}
          </div>
        </div>

        {validationErrors.skills && (
          <div className="andara-skill-focus-step__error">
            {validationErrors.skills}
          </div>
        )}

        {/* Skill Categories */}
        {Object.entries(SKILL_CATEGORIES).map(([categoryKey, categoryInfo]) => {
          const skills = skillsByCategory[categoryKey] || [];
          if (skills.length === 0) return null;

          return (
            <div
              key={categoryKey}
              className={`andara-skill-focus-step__category andara-skill-focus-step__category--${categoryKey}`}
            >
              <div className="andara-skill-focus-step__category-header">
                <div className="andara-skill-focus-step__category-icon">
                  {categoryInfo.icon}
                </div>
                <div className="andara-skill-focus-step__category-info">
                  <div className="andara-skill-focus-step__category-name">
                    {categoryInfo.name}
                  </div>
                  <div className="andara-skill-focus-step__category-description">
                    {categoryInfo.description}
                  </div>
                </div>
              </div>
              <div className="andara-skill-focus-step__skills-grid">
                {skills.map((skill: Skill) => {
                  const isSelected = formData.skillFocuses.includes(skill.id);
                  const isDisabled =
                    !isSelected && formData.skillFocuses.length >= maxSelections;
                  const baseProficiency = getBaseProficiency(
                    skill.id,
                    formData.origin
                  );
                  const hasOriginBonus = baseProficiency > 0;
                  const categoryColor = getCategoryColor(skill.category);

                  return (
                    <div
                      key={skill.id}
                      className={`andara-skill-focus-step__skill-card andara-skill-focus-step__skill-card--${categoryKey} ${
                        isSelected ? 'andara-skill-focus-step__skill-card--selected' : ''
                      } ${isDisabled ? 'andara-skill-focus-step__skill-card--disabled' : ''}`}
                      onClick={() => !isDisabled && handleToggleSkill(skill.id)}
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      aria-pressed={isSelected}
                      aria-label={`Select ${skill.name} skill`}
                      onKeyDown={(e) => {
                        if (
                          !isDisabled &&
                          (e.key === 'Enter' || e.key === ' ')
                        ) {
                          e.preventDefault();
                          handleToggleSkill(skill.id);
                        }
                      }}
                    >
                      <div className="andara-skill-focus-step__skill-header">
                        <div className="andara-skill-focus-step__skill-name">
                          {skill.name}
                        </div>
                        {hasOriginBonus && (
                          <div className="andara-skill-focus-step__skill-badge andara-skill-focus-step__skill-badge--origin">
                            Origin
                          </div>
                        )}
                      </div>
                      <div className="andara-skill-focus-step__skill-description">
                        {skill.description}
                      </div>
                      <div className="andara-skill-focus-step__skill-proficiency">
                        <span className="andara-skill-focus-step__proficiency-label">
                          Starting
                        </span>
                        <span
                          className={`andara-skill-focus-step__proficiency-value andara-skill-focus-step__proficiency-value--${categoryKey}`}
                          style={
                            isSelected ? { color: categoryColor } : undefined
                          }
                        >
                          {baseProficiency} → 20
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      <footer className="andara-skill-focus-step__actions">
        <Button variant="secondary" onClick={handleBack}>
          ← Back
        </Button>
        {formData.skillFocuses.length < maxSelections && (
          <span className="andara-skill-focus-step__warning">
            Select {maxSelections} skill focuses to continue
          </span>
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={formData.skillFocuses.length !== maxSelections}
        >
          Continue →
        </Button>
      </footer>
    </div>
  );
};
