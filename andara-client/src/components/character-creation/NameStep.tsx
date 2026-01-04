import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setStep,
  updateFormData,
  setValidationErrors,
} from '../../store/slices/characterCreationSlice';

export const NameStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { formData, validationErrors } = useAppSelector(
    (state) => state.characterCreation
  );

  const [name, setName] = useState(formData.name);

  const handleNext = () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length === 0) {
      dispatch(setValidationErrors({ name: 'Please enter a character name' }));
      return;
    }
    if (trimmedName.length < 2) {
      dispatch(
        setValidationErrors({ name: 'Name must be at least 2 characters' })
      );
      return;
    }
    if (trimmedName.length > 30) {
      dispatch(
        setValidationErrors({ name: 'Name must be 30 characters or less' })
      );
      return;
    }
    // Validate: alphanumeric + spaces/apostrophes/hyphens
    const nameRegex = /^[a-zA-Z0-9\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      dispatch(
        setValidationErrors({
          name: 'Name can only contain letters, numbers, spaces, apostrophes, and hyphens',
        })
      );
      return;
    }
    dispatch(updateFormData({ name: trimmedName }));
    dispatch(setStep('review'));
  };

  return (
    <div className="name-step">
      <h2>Name Your Character</h2>
      <p>Enter your character's name.</p>

      {validationErrors.name && (
        <div className="error">{validationErrors.name}</div>
      )}

      <div className="name-input">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            dispatch(setValidationErrors({}));
          }}
          placeholder="Enter character name"
          maxLength={30}
        />
        <div className="char-count">{name.length} / 30</div>
      </div>

      <div className="step-actions">
        <button onClick={() => dispatch(setStep('appearance'))}>Back</button>
        <button
          onClick={handleNext}
          disabled={
            !name ||
            name.trim().length < 2 ||
            name.trim().length > 30 ||
            !/^[a-zA-Z0-9\s'-]+$/.test(name.trim())
          }
        >
          Next: Review
        </button>
      </div>
    </div>
  );
};

