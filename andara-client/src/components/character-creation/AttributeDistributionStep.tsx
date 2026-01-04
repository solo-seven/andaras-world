import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setStep,
  updateFormData,
  setValidationErrors,
} from '../../store/slices/characterCreationSlice';
import type { Attributes } from '../../types/character';
import { Button } from '../ui/Button';
import { Stepper, StepperStep } from '../ui/Stepper';
import { AttributeSlider } from '../ui/AttributeSlider';
import { DerivedStatsPanel } from '../ui/DerivedStatsPanel';
import { TipsPanel } from '../ui/TipsPanel';
import { PointsRemaining } from '../ui/PointsRemaining';
import './AttributeDistributionStep.css';

const MIN_ATTRIBUTE = 6;
const MAX_ATTRIBUTE = 16;
const BASE_ATTRIBUTE = 8;
const POINTS_TO_DISTRIBUTE = 27;

const CHARACTER_CREATION_STEPS: StepperStep[] = [
  { id: 'origin', label: 'Origin' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'skills', label: 'Skills' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'name', label: 'Identity' },
];

const ATTRIBUTE_CONFIG = [
  {
    key: 'strength' as keyof Attributes,
    name: 'Strength',
    abbreviation: 'STR',
    description: 'Melee damage, carry capacity, physical checks',
  },
  {
    key: 'agility' as keyof Attributes,
    name: 'Agility',
    abbreviation: 'AGI',
    description: 'Initiative, ranged accuracy, evasion, movement',
  },
  {
    key: 'endurance' as keyof Attributes,
    name: 'Endurance',
    abbreviation: 'END',
    description: 'Health pool, stamina, resistance to injury/toxins',
  },
  {
    key: 'intellect' as keyof Attributes,
    name: 'Intellect',
    abbreviation: 'INT',
    description: 'Tech skills, crafting quality, ability cooldowns',
  },
  {
    key: 'perception' as keyof Attributes,
    name: 'Perception',
    abbreviation: 'PER',
    description: 'Detection, ranged accuracy, critical chance, arcane sensitivity',
  },
  {
    key: 'charisma' as keyof Attributes,
    name: 'Charisma',
    abbreviation: 'CHA',
    description: 'Barter prices, companion morale, faction standing gains',
  },
];

export const AttributeDistributionStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { formData, validationErrors, currentStep } = useAppSelector(
    (state) => state.characterCreation
  );

  const initialAttributes: Attributes = formData.attributes || {
    strength: BASE_ATTRIBUTE,
    agility: BASE_ATTRIBUTE,
    endurance: BASE_ATTRIBUTE,
    intellect: BASE_ATTRIBUTE,
    perception: BASE_ATTRIBUTE,
    charisma: BASE_ATTRIBUTE,
  };

  const [attributes, setAttributes] = useState<Attributes>(initialAttributes);

  // Sync local state with Redux store when formData.attributes changes
  // This handles the case when user navigates back to this step
  useEffect(() => {
    if (formData.attributes) {
      setAttributes(formData.attributes);
    } else {
      // Reset to base values if no attributes are saved
      setAttributes({
        strength: BASE_ATTRIBUTE,
        agility: BASE_ATTRIBUTE,
        endurance: BASE_ATTRIBUTE,
        intellect: BASE_ATTRIBUTE,
        perception: BASE_ATTRIBUTE,
        charisma: BASE_ATTRIBUTE,
      });
    }
  }, [formData.attributes]);

  // Calculate points remaining
  const pointsRemaining = useMemo(() => {
    const pointsUsed = Object.values(attributes).reduce(
      (sum, val) => sum + (val - BASE_ATTRIBUTE),
      0
    );
    return POINTS_TO_DISTRIBUTE - pointsUsed;
  }, [attributes]);

  const handleAttributeChange = (key: keyof Attributes, value: number) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
    // Clear validation errors when user makes changes
    if (validationErrors.attributes) {
      dispatch(setValidationErrors({}));
    }
  };

  const handleNext = () => {
    // Validate: points must be fully allocated
    if (pointsRemaining !== 0) {
      dispatch(
        setValidationErrors({
          attributes: `You must spend all ${POINTS_TO_DISTRIBUTE} points before continuing.`,
        })
      );
      return;
    }

    // At this point, pointsRemaining === 0 guarantees pointsUsed === POINTS_TO_DISTRIBUTE
    // No need for additional validation as it's mathematically impossible for pointsUsed > POINTS_TO_DISTRIBUTE

    dispatch(updateFormData({ attributes }));
    dispatch(setStep('skills'));
  };

  const handleBack = () => {
    dispatch(setStep('origin'));
  };

  const handleReset = () => {
    const resetAttributes: Attributes = {
      strength: BASE_ATTRIBUTE,
      agility: BASE_ATTRIBUTE,
      endurance: BASE_ATTRIBUTE,
      intellect: BASE_ATTRIBUTE,
      perception: BASE_ATTRIBUTE,
      charisma: BASE_ATTRIBUTE,
    };
    setAttributes(resetAttributes);
    dispatch(setValidationErrors({}));
  };

  return (
    <div className="andara-attribute-distribution-step">
      <header className="andara-attribute-distribution-step__header">
        <div className="andara-attribute-distribution-step__logo">
          ANDARA&apos;S WORLD
        </div>
        <Stepper steps={CHARACTER_CREATION_STEPS} currentStep={currentStep} />
      </header>

      <main className="andara-attribute-distribution-step__main">
        <h1 className="andara-attribute-distribution-step__title">
          Distribute Attributes
        </h1>
        <p className="andara-attribute-distribution-step__subtitle">
          You have <strong>{POINTS_TO_DISTRIBUTE} points</strong> to distribute
          among six core attributes. Each attribute starts at {BASE_ATTRIBUTE}.
          The range is {MIN_ATTRIBUTE}–{MAX_ATTRIBUTE} per attribute. Attributes
          affect combat effectiveness, carry capacity, skill checks, and more.
        </p>

        {validationErrors.attributes && (
          <div className="andara-attribute-distribution-step__error">
            {validationErrors.attributes}
          </div>
        )}

        <div className="andara-attribute-distribution-step__content-grid">
          {/* Attributes Panel */}
          <div className="andara-attribute-distribution-step__attributes-panel">
            <div className="andara-attribute-distribution-step__panel-header">
              <div className="andara-attribute-distribution-step__panel-title">
                Core Attributes
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-m)', alignItems: 'center' }}>
                <PointsRemaining points={pointsRemaining} />
                <Button variant="secondary" onClick={handleReset} type="button">
                  Reset
                </Button>
              </div>
            </div>

            {ATTRIBUTE_CONFIG.map((config) => (
              <AttributeSlider
                key={config.key}
                name={config.name}
                abbreviation={config.abbreviation}
                value={attributes[config.key]}
                description={config.description}
                min={MIN_ATTRIBUTE}
                max={MAX_ATTRIBUTE}
                onChange={(value) => handleAttributeChange(config.key, value)}
              />
            ))}
          </div>

          {/* Info Panel */}
          <div className="andara-attribute-distribution-step__info-panel">
            <DerivedStatsPanel attributes={attributes} />
            <TipsPanel />
          </div>
        </div>
      </main>

      <footer className="andara-attribute-distribution-step__actions">
        <Button variant="secondary" onClick={handleBack}>
          ← Back
        </Button>
        {pointsRemaining !== 0 && (
          <span className="andara-attribute-distribution-step__warning">
            You must spend all points
          </span>
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={pointsRemaining !== 0}
        >
          Continue →
        </Button>
      </footer>
    </div>
  );
};
