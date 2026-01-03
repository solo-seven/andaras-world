import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setStep,
  updateFormData,
  setValidationErrors,
} from '../../store/slices/characterCreationSlice';
import { Origin } from '../../types/character';

export const OriginSelectionStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availableOrigins, formData, validationErrors } = useAppSelector(
    (state) => state.characterCreation
  );

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

  return (
    <div className="origin-selection-step">
      <h2>Select Your Origin</h2>
      <p>Choose your character's background. This affects starting skills and bonuses.</p>

      {validationErrors.origin && (
        <div className="error">{validationErrors.origin}</div>
      )}

      <div className="origin-list">
        {availableOrigins.map((origin) => (
          <div
            key={origin.id}
            className={`origin-card ${
              formData.origin === origin.id ? 'selected' : ''
            }`}
            onClick={() => handleSelectOrigin(origin.id)}
          >
            <h3>{origin.displayName}</h3>
            <p>{origin.description}</p>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button onClick={handleNext} disabled={!formData.origin}>
          Next: Attributes
        </button>
      </div>
    </div>
  );
};

