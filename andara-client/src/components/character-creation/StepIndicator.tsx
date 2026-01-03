import React from 'react';
import type { CharacterCreationStep } from '../../store/slices/characterCreationSlice';

interface StepIndicatorProps {
  currentStep: CharacterCreationStep;
  steps: { id: CharacterCreationStep; label: string }[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`step ${index === currentIndex ? 'active' : ''} ${
            index < currentIndex ? 'completed' : ''
          }`}
        >
          <div className="step-number">{index + 1}</div>
          <div className="step-label">{step.label}</div>
        </div>
      ))}
    </div>
  );
};

