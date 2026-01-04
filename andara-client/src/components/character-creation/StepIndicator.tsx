import React from 'react';
import { Stepper } from '../ui/Stepper';
import type { CharacterCreationStep } from '../../store/slices/characterCreationSlice';

interface StepIndicatorProps {
  currentStep: CharacterCreationStep;
  steps: { id: CharacterCreationStep; label: string }[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  // Filter out 'review' step as it's not shown in the stepper (maps to 'name' for display)
  // Only show the main creation steps: Origin → Attributes → Skills → Appearance → Name
  const stepperSteps = steps.filter((step) => step.id !== 'review');
  
  // Map current step to stepper step (review step maps to name step for display)
  const stepperStep =
    currentStep === 'review' ? 'name' : currentStep;

  return (
    <div className="step-indicator">
      <Stepper steps={stepperSteps} currentStep={stepperStep} />
    </div>
  );
};