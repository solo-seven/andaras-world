import React from 'react';
import './Stepper.css';

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  currentStep: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="andara-stepper">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`andara-stepper__step ${
                isActive ? 'andara-stepper__step--active' : ''
              } ${isCompleted ? 'andara-stepper__step--completed' : ''} ${
                isUpcoming ? 'andara-stepper__step--upcoming' : ''
              }`}
            >
              <div className="andara-stepper__indicator">
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className="andara-stepper__label">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`andara-stepper__connector ${
                  isCompleted ? 'andara-stepper__connector--completed' : ''
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

