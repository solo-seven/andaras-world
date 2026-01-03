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
    if (trimmedName.length > 50) {
      dispatch(
        setValidationErrors({ name: 'Name must be 50 characters or less' })
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
          maxLength={50}
        />
        <div className="char-count">{name.length} / 50</div>
      </div>

      <div className="step-actions">
        <button onClick={() => dispatch(setStep('appearance'))}>Back</button>
        <button onClick={handleNext} disabled={!name || name.trim().length === 0 || name.trim().length > 50}>
          Next: Review
        </button>
      </div>
    </div>
  );
};

