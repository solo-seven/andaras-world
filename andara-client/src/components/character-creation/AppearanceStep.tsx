import React, { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { store } from '../../store/index';
import {
  setStep,
  updateFormData,
} from '../../store/slices/characterCreationSlice';
import type { Appearance } from '../../types/character';
import {
  BodyType,
  HairStyle,
  HairColor,
  SkinTone,
  EyeColor,
  ScarsMarks,
} from '../../types/character';
import { Button } from '../ui/Button';
import { Stepper, StepperStep } from '../ui/Stepper';
import './AppearanceStep.css';

const CHARACTER_CREATION_STEPS: StepperStep[] = [
  { id: 'origin', label: 'Origin' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'skills', label: 'Skills' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'name', label: 'Identity' },
];

const DEFAULT_APPEARANCE: Appearance = {
  bodyType: BodyType.MASCULINE,
  hairStyle: HairStyle.SHORT,
  hairColor: HairColor.BLACK,
  skinTone: SkinTone.FAIR,
  eyeColor: EyeColor.BLUE,
  ageAppearance: 32,
  scarsMarks: ScarsMarks.WEATHERED,
};

// Color mappings for swatches
const HAIR_COLOR_MAP: Record<HairColor, string> = {
  [HairColor.BLACK]: '#1a1a1a',
  [HairColor.BROWN]: '#3d2817',
  [HairColor.BLONDE]: '#c4a265',
  [HairColor.RED]: '#8b3a3a',
  [HairColor.WHITE]: '#e8e8e8',
  [HairColor.BLUE]: '#2c4a6d',
};

const SKIN_TONE_MAP: Record<SkinTone, string> = {
  [SkinTone.PALE]: '#f5d5c1',
  [SkinTone.FAIR]: '#e8b89a',
  [SkinTone.MEDIUM]: '#c68967',
  [SkinTone.TAN]: '#9d6b4f',
  [SkinTone.BROWN]: '#6b4532',
  [SkinTone.DARK]: '#3d2817',
};

const EYE_COLOR_MAP: Record<EyeColor, string> = {
  [EyeColor.BROWN]: '#3d2817',
  [EyeColor.BLUE]: '#4d7a9d',
  [EyeColor.GREEN]: '#4a6d4a',
  [EyeColor.HAZEL]: '#7a6d4a',
  [EyeColor.GRAY]: '#6d6d6d',
  [EyeColor.AMBER]: '#c4a265',
};

export const AppearanceStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { formData, currentStep } = useAppSelector(
    (state) => state.characterCreation
  );

  const currentAppearance: Appearance =
    formData.appearance || DEFAULT_APPEARANCE;

  const updateAppearance = useCallback(
    (updates: Partial<Appearance>) => {
      const state = store.getState();
      const latestAppearance =
        state.characterCreation.formData.appearance || DEFAULT_APPEARANCE;
      dispatch(
        updateFormData({
          appearance: { ...latestAppearance, ...updates },
        })
      );
    },
    [dispatch]
  );

  const handleBodyTypeChange = (bodyType: BodyType) => {
    updateAppearance({ bodyType });
  };

  const handleHairStyleChange = (hairStyle: HairStyle) => {
    updateAppearance({ hairStyle });
  };

  const handleHairColorChange = (hairColor: HairColor) => {
    updateAppearance({ hairColor });
  };

  const handleSkinToneChange = (skinTone: SkinTone) => {
    updateAppearance({ skinTone });
  };

  const handleEyeColorChange = (eyeColor: EyeColor) => {
    updateAppearance({ eyeColor });
  };

  const handleAgeChange = (age: number) => {
    updateAppearance({ ageAppearance: age });
  };

  const handleScarsMarksChange = (scarsMarks: ScarsMarks) => {
    updateAppearance({ scarsMarks });
  };

  const handleRandomize = () => {
    const randomBodyType =
      Object.values(BodyType)[
        Math.floor(Math.random() * Object.values(BodyType).length)
      ];
    const randomHairStyle =
      Object.values(HairStyle)[
        Math.floor(Math.random() * Object.values(HairStyle).length)
      ];
    const randomHairColor =
      Object.values(HairColor)[
        Math.floor(Math.random() * Object.values(HairColor).length)
      ];
    const randomSkinTone =
      Object.values(SkinTone)[
        Math.floor(Math.random() * Object.values(SkinTone).length)
      ];
    const randomEyeColor =
      Object.values(EyeColor)[
        Math.floor(Math.random() * Object.values(EyeColor).length)
      ];
    const randomAge = Math.floor(Math.random() * (70 - 18 + 1)) + 18;
    const randomScarsMarks =
      Object.values(ScarsMarks)[
        Math.floor(Math.random() * Object.values(ScarsMarks).length)
      ];

    dispatch(
      updateFormData({
        appearance: {
          bodyType: randomBodyType,
          hairStyle: randomHairStyle,
          hairColor: randomHairColor,
          skinTone: randomSkinTone,
          eyeColor: randomEyeColor,
          ageAppearance: randomAge,
          scarsMarks: randomScarsMarks,
        },
      })
    );
  };

  const handleNext = () => {
    dispatch(setStep('name'));
  };

  const handleBack = () => {
    dispatch(setStep('skills'));
  };

  return (
    <div className="andara-appearance-step">
      <header className="andara-appearance-step__header">
        <div className="andara-appearance-step__logo">ANDARA&apos;S WORLD</div>
        <Stepper steps={CHARACTER_CREATION_STEPS} currentStep={currentStep} />
      </header>

      <main className="andara-appearance-step__main">
        <h1 className="andara-appearance-step__title">
          Customize Appearance
        </h1>
        <p className="andara-appearance-step__subtitle">
          Define your protagonist&apos;s physical appearance. These choices are
          cosmetic and do not affect gameplay. You can randomize all options at
          any time.
        </p>

        <div className="andara-appearance-step__layout">
          {/* Preview Panel */}
          <div className="andara-appearance-step__preview">
            <div className="andara-appearance-step__preview-header">
              Character Preview
            </div>
            <div className="andara-appearance-step__preview-viewport">
              <div className="andara-appearance-step__character-silhouette"></div>
            </div>
            <div className="andara-appearance-step__preview-info">
              Visual preview would render here with actual 3D model or sprite
            </div>
          </div>

          {/* Options Panel */}
          <div className="andara-appearance-step__options">
            {/* Body Type */}
            <div className="andara-appearance-step__option-group">
              <div className="andara-appearance-step__option-label">
                Body Type
                <span className="andara-appearance-step__option-value">
                  {currentAppearance.bodyType.replace('_', '-')}
                </span>
              </div>
              <div className="andara-appearance-step__option-buttons">
                {Object.values(BodyType).map((bodyType) => (
                  <button
                    key={bodyType}
                    className={`andara-appearance-step__option-btn ${
                      currentAppearance.bodyType === bodyType ? 'selected' : ''
                    }`}
                    onClick={() => handleBodyTypeChange(bodyType)}
                  >
                    {bodyType.replace('_', '-')}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div className="andara-appearance-step__option-group">
              <div className="andara-appearance-step__option-label">
                Hair Style
                <span className="andara-appearance-step__option-value">
                  {currentAppearance.hairStyle.replace('_', '-')}
                </span>
              </div>
              <div className="andara-appearance-step__option-buttons">
                {Object.values(HairStyle).map((hairStyle) => (
                  <button
                    key={hairStyle}
                    className={`andara-appearance-step__option-btn ${
                      currentAppearance.hairStyle === hairStyle ? 'selected' : ''
                    }`}
                    onClick={() => handleHairStyleChange(hairStyle)}
                  >
                    {hairStyle.replace('_', '-')}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div className="andara-appearance-step__option-group">
              <div className="andara-appearance-step__option-label">
                Hair Color
                <span className="andara-appearance-step__option-value">
                  {currentAppearance.hairColor}
                </span>
              </div>
              <div className="andara-appearance-step__color-swatches">
                {Object.values(HairColor).map((hairColor) => (
                  <div
                    key={hairColor}
                    className={`andara-appearance-step__color-swatch ${
                      currentAppearance.hairColor === hairColor ? 'selected' : ''
                    }`}
                    style={{ backgroundColor: HAIR_COLOR_MAP[hairColor] }}
                    onClick={() => handleHairColorChange(hairColor)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleHairColorChange(hairColor);
                      }
                    }}
                    aria-label={`Select ${hairColor} hair color`}
                  />
                ))}
              </div>
            </div>

            {/* Skin Tone */}
            <div className="andara-appearance-step__option-group">
              <div className="andara-appearance-step__option-label">
                Skin Tone
                <span className="andara-appearance-step__option-value">
                  {currentAppearance.skinTone}
                </span>
              </div>
              <div className="andara-appearance-step__color-swatches">
                {Object.values(SkinTone).map((skinTone) => (
                  <div
                    key={skinTone}
                    className={`andara-appearance-step__color-swatch ${
                      currentAppearance.skinTone === skinTone ? 'selected' : ''
                    }`}
                    style={{ backgroundColor: SKIN_TONE_MAP[skinTone] }}
                    onClick={() => handleSkinToneChange(skinTone)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSkinToneChange(skinTone);
                      }
                    }}
                    aria-label={`Select ${skinTone} skin tone`}
                  />
                ))}
              </div>
            </div>

            {/* Eye Color */}
            <div className="andara-appearance-step__option-group">
              <div className="andara-appearance-step__option-label">
                Eye Color
                <span className="andara-appearance-step__option-value">
                  {currentAppearance.eyeColor}
                </span>
              </div>
              <div className="andara-appearance-step__color-swatches">
                {Object.values(EyeColor).map((eyeColor) => (
                  <div
                    key={eyeColor}
                    className={`andara-appearance-step__color-swatch ${
                      currentAppearance.eyeColor === eyeColor ? 'selected' : ''
                    }`}
                    style={{ backgroundColor: EYE_COLOR_MAP[eyeColor] }}
                    onClick={() => handleEyeColorChange(eyeColor)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEyeColorChange(eyeColor);
                      }
                    }}
                    aria-label={`Select ${eyeColor} eye color`}
                  />
                ))}
              </div>
            </div>

            {/* Age Slider */}
            <div className="andara-appearance-step__option-group">
              <div className="andara-appearance-step__option-label">
                Age Appearance
                <span className="andara-appearance-step__option-value">
                  {currentAppearance.ageAppearance}
                </span>
              </div>
              <div className="andara-appearance-step__slider-control">
                <input
                  type="range"
                  min="18"
                  max="70"
                  value={currentAppearance.ageAppearance}
                  className="andara-appearance-step__slider"
                  onChange={(e) => handleAgeChange(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Scars/Marks */}
            <div className="andara-appearance-step__option-group">
              <div className="andara-appearance-step__option-label">
                Scars & Marks
                <span className="andara-appearance-step__option-value">
                  {currentAppearance.scarsMarks.replace('_', '-')}
                </span>
              </div>
              <div className="andara-appearance-step__option-buttons">
                {Object.values(ScarsMarks).map((scarsMarks) => (
                  <button
                    key={scarsMarks}
                    className={`andara-appearance-step__option-btn ${
                      currentAppearance.scarsMarks === scarsMarks
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleScarsMarksChange(scarsMarks)}
                  >
                    {scarsMarks.replace('_', '-')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="andara-appearance-step__actions">
        <Button variant="secondary" onClick={handleBack}>
          ← Back
        </Button>
        <Button
          variant="secondary"
          onClick={handleRandomize}
          className="andara-appearance-step__randomize-btn"
        >
          <span>⚄</span> Randomize All
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Continue →
        </Button>
      </footer>
    </div>
  );
};
