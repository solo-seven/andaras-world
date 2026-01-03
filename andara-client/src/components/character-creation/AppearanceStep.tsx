import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { store } from '../../store/index';
import {
  setStep,
  updateFormData,
} from '../../store/slices/characterCreationSlice';
import type { Appearance } from '../../types/character';
import { Gender, BodyType } from '../../types/character';

const DEFAULT_APPEARANCE: Appearance = {
  gender: Gender.NON_BINARY,
  bodyType: BodyType.AVERAGE,
};

export const AppearanceStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { formData } = useAppSelector((state) => state.characterCreation);

  const currentAppearance: Appearance = formData.appearance || DEFAULT_APPEARANCE;

  const handleGenderChange = (gender: Gender) => {
    // Read latest appearance state directly from Redux store to avoid stale closures
    // This ensures rapid consecutive changes don't lose previous updates
    const state = store.getState();
    const latestAppearance = state.characterCreation.formData.appearance || DEFAULT_APPEARANCE;
    dispatch(
      updateFormData({
        appearance: { ...latestAppearance, gender },
      })
    );
  };

  const handleBodyTypeChange = (bodyType: BodyType) => {
    // Read latest appearance state directly from Redux store to avoid stale closures
    // This ensures rapid consecutive changes don't lose previous updates
    const state = store.getState();
    const latestAppearance = state.characterCreation.formData.appearance || DEFAULT_APPEARANCE;
    dispatch(
      updateFormData({
        appearance: { ...latestAppearance, bodyType },
      })
    );
  };

  const handleNext = () => {
    dispatch(setStep('name'));
  };

  return (
    <div className="appearance-step">
      <h2>Customize Appearance</h2>
      <p>Set your character's basic appearance.</p>

      <div className="appearance-section">
        <h3>Gender</h3>
        <div className="option-group">
          {Object.values(Gender).map((gender) => (
            <label key={gender} className="radio-option">
              <input
                type="radio"
                name="gender"
                value={gender}
                checked={currentAppearance.gender === gender}
                onChange={() => handleGenderChange(gender)}
              />
              <span>{gender.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="appearance-section">
        <h3>Body Type</h3>
        <div className="option-group">
          {Object.values(BodyType).map((bodyType) => (
            <label key={bodyType} className="radio-option">
              <input
                type="radio"
                name="bodyType"
                value={bodyType}
                checked={currentAppearance.bodyType === bodyType}
                onChange={() => handleBodyTypeChange(bodyType)}
              />
              <span>{bodyType}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <button onClick={() => dispatch(setStep('skills'))}>Back</button>
        <button onClick={handleNext}>Next: Name</button>
      </div>
    </div>
  );
};

