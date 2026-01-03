import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setStep,
  setSubmitting,
  setCreatedCharacterId,
} from '../../store/slices/characterCreationSlice';
import { createCharacter } from '../../api/characterApi';
import { useNavigate } from 'react-router-dom';

export const ReviewStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { formData, isSubmitting } = useAppSelector(
    (state) => state.characterCreation
  );

  const handleSubmit = async () => {
    if (!formData.name || !formData.origin || !formData.attributes || 
        formData.skillFocuses.length !== 2 || !formData.appearance) {
      return;
    }

    dispatch(setSubmitting(true));

    try {
      // For prototype, use placeholder UUIDs
      const instanceId = crypto.randomUUID();
      const agentId = crypto.randomUUID();

      const response = await createCharacter({
        name: formData.name,
        origin: formData.origin,
        attributes: formData.attributes,
        skillFocuses: formData.skillFocuses,
        appearance: formData.appearance,
        isProtagonist: formData.isProtagonist,
        instanceId,
        agentId,
      });

      dispatch(setCreatedCharacterId(response.characterId));
      // Navigate to game or character sheet
      navigate('/game');
    } catch (error) {
      console.error('Failed to create character:', error);
      alert('Failed to create character. Please try again.');
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  const getOriginName = (originId: string) => {
    const origins: Record<string, string> = {
      VAULT_DWELLER: 'Vault Dweller',
      WASTELANDER: 'Wastelander',
      RIFT_TOUCHED: 'Rift-Touched',
    };
    return origins[originId] || originId;
  };

  return (
    <div className="review-step">
      <h2>Review Your Character</h2>
      <p>Review your character details before creation.</p>

      <div className="review-section">
        <h3>Basic Information</h3>
        <p>
          <strong>Name:</strong> {formData.name}
        </p>
        <p>
          <strong>Origin:</strong> {formData.origin && getOriginName(formData.origin)}
        </p>
      </div>

      {formData.attributes && (
        <div className="review-section">
          <h3>Attributes</h3>
          <div className="attributes-grid">
            <div>Strength: {formData.attributes.strength}</div>
            <div>Agility: {formData.attributes.agility}</div>
            <div>Endurance: {formData.attributes.endurance}</div>
            <div>Intellect: {formData.attributes.intellect}</div>
            <div>Perception: {formData.attributes.perception}</div>
            <div>Charisma: {formData.attributes.charisma}</div>
          </div>
        </div>
      )}

      {formData.skillFocuses.length > 0 && (
        <div className="review-section">
          <h3>Focus Skills</h3>
          <ul>
            {formData.skillFocuses.map((skillId) => (
              <li key={skillId}>{skillId}</li>
            ))}
          </ul>
        </div>
      )}

      {formData.appearance && (
        <div className="review-section">
          <h3>Appearance</h3>
          <p>
            <strong>Gender:</strong> {formData.appearance.gender.replace('_', ' ')}
          </p>
          <p>
            <strong>Body Type:</strong> {formData.appearance.bodyType}
          </p>
        </div>
      )}

      <div className="step-actions">
        <button onClick={() => dispatch(setStep('name'))} disabled={isSubmitting}>
          Back
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Character'}
        </button>
      </div>
    </div>
  );
};

