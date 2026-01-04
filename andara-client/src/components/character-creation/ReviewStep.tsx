import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setStep } from '../../store/slices/characterCreationSlice';
import { useNavigate } from 'react-router-dom';
import { CharacterSummary } from '../ui/CharacterSummary';
import { Button } from '../ui/Button';
import { Stepper, StepperStep } from '../ui/Stepper';
import { ErrorBanner } from '../ui/ErrorBanner';
import { startNewGameAsync, setValidationErrors, reset } from '../../store/slices/characterCreationSlice';

export const ReviewStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { formData, isSubmitting, validationErrors, createdCharacterId } =
    useAppSelector((state) => state.characterCreation);
  const hasNavigatedRef = useRef(false);

  // Navigate to character sheet when character is created
  // Pass characterId in URL to avoid dependency on Redux state after unmount
  // Note: State reset is handled by CharacterCreationWizard on mount if needed
  useEffect(() => {
    if (createdCharacterId && !hasNavigatedRef.current) {
      const characterId = createdCharacterId;
      hasNavigatedRef.current = true;
      navigate(`/character-sheet/${characterId}`);
      
      // Reset state immediately before navigation to clean up
      // This happens before the component unmounts, ensuring the reset executes
      // The navigation will proceed, and CharacterSheet reads from URL params
      dispatch(reset());
    }
  }, [createdCharacterId, navigate, dispatch]);

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.origin ||
      !formData.attributes ||
      formData.skillFocuses.length !== 2 ||
      !formData.appearance
    ) {
      return;
    }

    dispatch(startNewGameAsync());
  };

  const CHARACTER_CREATION_STEPS: StepperStep[] = [
    { id: 'origin', label: 'Origin' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'skills', label: 'Skills' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'name', label: 'Identity' },
  ];

  const { currentStep, availableOrigins, availableSkills } =
    useAppSelector((state) => state.characterCreation);

  // Map current step to stepper step (review step maps to name step for display)
  const stepperStep = currentStep === 'review' ? 'name' : currentStep;

  return (
    <div className="review-step">
      <header className="review-step__header">
        <div className="review-step__logo">ANDARA&apos;S WORLD</div>
        <Stepper steps={CHARACTER_CREATION_STEPS} currentStep={stepperStep} />
      </header>

      <main className="review-step__main">
        <h1 className="review-step__title">Review Your Character</h1>
        <p className="review-step__subtitle">
          Review your character details before creation. Once created, you cannot
          change these details.
        </p>

        <CharacterSummary
          name={formData.name}
          origin={formData.origin}
          attributes={formData.attributes}
          skills={formData.skillFocuses}
          appearance={formData.appearance}
          availableOrigins={availableOrigins}
          availableSkills={availableSkills}
        />

        {validationErrors.submit && (
          <ErrorBanner
            message={validationErrors.submit}
            onDismiss={() => dispatch(setValidationErrors({}))}
          />
        )}
      </main>

      <footer className="review-step__actions">
        <Button
          variant="secondary"
          onClick={() => dispatch(setStep('name'))}
          disabled={isSubmitting}
        >
          ← Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !formData.name ||
            !formData.origin ||
            !formData.attributes ||
            formData.skillFocuses.length !== 2 ||
            !formData.appearance
          }
        >
          {isSubmitting ? 'Creating Character...' : 'Create Character'}
        </Button>
      </footer>
    </div>
  );
};

