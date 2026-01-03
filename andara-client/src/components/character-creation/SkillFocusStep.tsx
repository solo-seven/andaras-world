import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setStep,
  updateFormData,
  setValidationErrors,
} from '../../store/slices/characterCreationSlice';

export const SkillFocusStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availableSkills, formData, validationErrors } = useAppSelector(
    (state) => state.characterCreation
  );

  const handleToggleSkill = (skillId: string) => {
    const current = formData.skillFocuses;
    const newFocuses = current.includes(skillId)
      ? current.filter((id) => id !== skillId)
      : current.length < 2
      ? [...current, skillId]
      : [current[1], skillId]; // Replace first with new selection

    dispatch(updateFormData({ skillFocuses: newFocuses }));
    dispatch(setValidationErrors({}));
  };

  const handleNext = () => {
    if (formData.skillFocuses.length !== 2) {
      dispatch(
        setValidationErrors({
          skills: 'Please select exactly 2 focus skills',
        })
      );
      return;
    }
    dispatch(setStep('appearance'));
  };

  const skillsByCategory = availableSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, typeof availableSkills>
  );

  return (
    <div className="skill-focus-step">
      <h2>Select Focus Skills</h2>
      <p>Choose 2 skills to start with proficiency 20.</p>

      {validationErrors.skills && (
        <div className="error">{validationErrors.skills}</div>
      )}

      <div className="selected-count">
        Selected: {formData.skillFocuses.length} / 2
      </div>

      <div className="skill-categories">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category} className="skill-category">
            <h3>{category}</h3>
            <div className="skill-list">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`skill-card ${
                    formData.skillFocuses.includes(skill.id) ? 'selected' : ''
                  } ${
                    !formData.skillFocuses.includes(skill.id) &&
                    formData.skillFocuses.length >= 2
                      ? 'disabled'
                      : ''
                  }`}
                  onClick={() => handleToggleSkill(skill.id)}
                >
                  <h4>{skill.name}</h4>
                  <p>{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button onClick={() => dispatch(setStep('attributes'))}>Back</button>
        <button
          onClick={handleNext}
          disabled={formData.skillFocuses.length !== 2}
        >
          Next: Appearance
        </button>
      </div>
    </div>
  );
};

