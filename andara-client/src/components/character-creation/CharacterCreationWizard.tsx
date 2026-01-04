import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Button } from '../ui/Button';
import './CharacterCreationWizard.css';
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
  const navigate = useNavigate();
  const { currentStep, createdCharacterId } = useAppSelector(
    (state) => state.characterCreation
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const hasCheckedStaleStateRef = useRef(false);

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
  }, [dispatch]);

  // Reset stale state on mount if user returns to character creation after a previous session
  // Use a ref to ensure this only runs once per mount, not when createdCharacterId changes
  useEffect(() => {
    // Only reset stale state on first mount, not when createdCharacterId changes during active creation
    // During active creation, ReviewStep handles the reset, not this component
    if (!hasCheckedStaleStateRef.current && createdCharacterId) {
      hasCheckedStaleStateRef.current = true;
      dispatch(reset());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only check on mount

  // Reset on unmount if navigating away without creating a character
  useEffect(() => {
    return () => {
      // Only reset on unmount if no character was created
      // If a character was created, ReviewStep handles the reset before navigation
      if (!createdCharacterId) {
        dispatch(reset());
      }
    };
  }, [dispatch, createdCharacterId]);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    dispatch(reset());
    navigate('/');
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

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
      <div className="character-creation-wizard__header">
        <StepIndicator currentStep={currentStep} steps={STEPS} />
        <Button
          variant="secondary"
          onClick={handleCancel}
          className="character-creation-wizard__cancel"
        >
          Cancel
        </Button>
      </div>
      <div className="wizard-content">{renderStep()}</div>
      <ConfirmationModal
        isOpen={showCancelModal}
        title="Cancel Character Creation"
        message="Are you sure you want to cancel? All progress will be lost."
        confirmLabel="Cancel Creation"
        cancelLabel="Continue"
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelModalClose}
        variant="danger"
      />
    </div>
  );
};

