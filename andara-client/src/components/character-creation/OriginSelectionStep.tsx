import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setStep,
  updateFormData,
  setValidationErrors,
} from '../../store/slices/characterCreationSlice';
import { Origin, OriginDefinition, OriginStat } from '../../types/character';
import { Button } from '../ui/Button';
import { OriginCard, OriginCardData } from '../ui/OriginCard';
import { Stepper, StepperStep } from '../ui/Stepper';
import { SelectionSummary } from '../ui/SelectionSummary';
import './OriginSelectionStep.css';

const CHARACTER_CREATION_STEPS: StepperStep[] = [
  { id: 'origin', label: 'Origin' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'skills', label: 'Skills' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'name', label: 'Identity' },
];

// Helper function to convert OriginDefinition to OriginCardData
const convertToOriginCardData = (origin: OriginDefinition): OriginCardData => {
  const stats: OriginStat[] = [];

  // Add bonuses
  if (origin.bonuses && origin.bonuses.length > 0) {
    stats.push({
      label: 'Bonus',
      value: origin.bonuses.join(', '),
      type: 'positive',
    });
  }

  // Add starting gear
  if (origin.startingGear) {
    stats.push({
      label: 'Starting Gear',
      value: origin.startingGear,
      type: 'neutral',
    });
  }

  // Add faction relationships
  if (origin.factionRelationships) {
    Object.entries(origin.factionRelationships).forEach(([faction, value]) => {
      stats.push({
        label: 'Faction',
        value: `${faction} ${value > 0 ? '+' : ''}${value}`,
        type: 'neutral',
      });
    });
  }

  // Add special abilities
  if (origin.specialAbilities && origin.specialAbilities.length > 0) {
    stats.push({
      label: 'Special',
      value: origin.specialAbilities.join(', '),
      type: 'neutral',
    });
  }

  // Add penalties
  if (origin.penalties && origin.penalties.length > 0) {
    stats.push({
      label: 'Penalty',
      value: origin.penalties.join(', '),
      type: 'negative',
    });
  }

  // Use stats from origin if available and non-empty, otherwise use constructed stats
  const finalStats = (origin.stats && origin.stats.length > 0) ? origin.stats : stats;

  return {
    id: origin.id,
    displayName: origin.displayName,
    description: origin.description,
    icon: origin.icon || '⚙',
    stats: finalStats,
  };
};

export const OriginSelectionStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { availableOrigins, formData, validationErrors, currentStep } =
    useAppSelector((state) => state.characterCreation);

  const handleSelectOrigin = (originId: string) => {
    // Validate that the origin ID is a valid Origin enum value
    const validOrigins = Object.values(Origin) as string[];
    if (!validOrigins.includes(originId)) {
      dispatch(
        setValidationErrors({
          origin: `Invalid origin: ${originId}. Please select a valid origin.`,
        })
      );
      return;
    }
    // Safe to cast after validation
    dispatch(updateFormData({ origin: originId as Origin }));
    dispatch(setValidationErrors({}));
  };

  const handleNext = () => {
    if (!formData.origin) {
      dispatch(setValidationErrors({ origin: 'Please select an origin' }));
      return;
    }
    dispatch(setStep('attributes'));
  };

  const handleBack = () => {
    // Navigate back to home/main menu since this is the first step
    navigate('/');
  };

  const selectedOrigin = useMemo(() => {
    if (!formData.origin) return null;
    return availableOrigins.find((origin: OriginDefinition) => origin.id === formData.origin);
  }, [formData.origin, availableOrigins]);

  const originCards = useMemo(() => {
    return availableOrigins.map(convertToOriginCardData);
  }, [availableOrigins]);

  return (
    <div className="andara-origin-selection-step">
      <header className="andara-origin-selection-step__header">
        <div className="andara-origin-selection-step__logo">ANDARA&apos;S WORLD</div>
        <Stepper steps={CHARACTER_CREATION_STEPS} currentStep={currentStep} />
      </header>

      <main className="andara-origin-selection-step__main">
        <h1 className="andara-origin-selection-step__title">
          Choose Your Origin
        </h1>
        <p className="andara-origin-selection-step__subtitle">
          Your background shapes who you were before the Convergence and
          determines your starting skills, equipment, and faction relationships.
          Choose the path that resonates with your vision for survival.
        </p>

        {validationErrors.origin && (
          <div className="andara-origin-selection-step__error">
            {validationErrors.origin}
          </div>
        )}

        <div className="andara-origin-selection-step__grid">
          {originCards.map((originCard: OriginCardData) => (
            <OriginCard
              key={originCard.id}
              origin={originCard}
              selected={formData.origin === originCard.id}
              onClick={() => handleSelectOrigin(originCard.id)}
            />
          ))}
        </div>
      </main>

      <footer className="andara-origin-selection-step__actions">
        <Button variant="secondary" onClick={handleBack}>
          ← Back
        </Button>
        <SelectionSummary
          selectedOriginName={selectedOrigin?.displayName}
        />
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!formData.origin}
        >
          Continue →
        </Button>
      </footer>
    </div>
  );
};
