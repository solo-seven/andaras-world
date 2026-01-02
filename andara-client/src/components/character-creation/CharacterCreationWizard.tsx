import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setOrigins,
  setSkills,
  reset,
} from '../../store/slices/characterCreationSlice';
import { getOrigins, getSkills } from '../../api/characterApi';
import { StepIndicator } from './StepIndicator';
import { OriginSelectionStep } from './OriginSelectionStep';
import { AttributeDistributionStep } from './AttributeDistributionStep';
import { SkillFocusStep } from './SkillFocusStep';
import { AppearanceStep } from './AppearanceStep';
import { NameStep } from './NameStep';
import { ReviewStep } from './ReviewStep';
import type { CharacterCreationStep } from '../../store/slices/characterCreationSlice';

const STEPS: { id: CharacterCreationStep; label: string }[] = [
  { id: 'origin', label: 'Origin' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'skills', label: 'Skills' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'name', label: 'Name' },
  { id: 'review', label: 'Review' },
];

export const CharacterCreationWizard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStep } = useAppSelector(
    (state) => state.characterCreation
  );

  useEffect(() => {
    // Load origins and skills on mount
    const loadData = async () => {
      try {
        const [origins, skills] = await Promise.all([
          getOrigins(),
          getSkills(),
        ]);
        dispatch(setOrigins(origins));
        dispatch(setSkills(skills));
      } catch (error) {
        console.error('Failed to load character creation data:', error);
      }
    };

    loadData();

    // Reset on unmount
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const renderStep = () => {
    switch (currentStep) {
      case 'origin':
        return <OriginSelectionStep />;
      case 'attributes':
        return <AttributeDistributionStep />;
      case 'skills':
        return <SkillFocusStep />;
      case 'appearance':
        return <AppearanceStep />;
      case 'name':
        return <NameStep />;
      case 'review':
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="character-creation-wizard">
      <StepIndicator currentStep={currentStep} steps={STEPS} />
      <div className="wizard-content">{renderStep()}</div>
    </div>
  );
};

