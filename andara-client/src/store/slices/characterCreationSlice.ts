import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Origin,
  Attributes,
  Appearance,
  OriginDefinition,
  Skill,
} from '../../types/character';

export type CharacterCreationStep =
  | 'origin'
  | 'attributes'
  | 'skills'
  | 'appearance'
  | 'name'
  | 'review';

interface CharacterCreationState {
  currentStep: CharacterCreationStep;
  formData: {
    name: string;
    origin: Origin | null;
    attributes: Attributes | null;
    skillFocuses: string[];
    appearance: Appearance | null;
    isProtagonist: boolean;
  };
  availableOrigins: OriginDefinition[];
  availableSkills: Skill[];
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
  createdCharacterId: string | null;
}

const initialState: CharacterCreationState = {
  currentStep: 'origin',
  formData: {
    name: '',
    origin: null,
    attributes: null,
    skillFocuses: [],
    appearance: null,
    isProtagonist: true,
  },
  availableOrigins: [],
  availableSkills: [],
  validationErrors: {},
  isSubmitting: false,
  createdCharacterId: null,
};

const characterCreationSlice = createSlice({
  name: 'characterCreation',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<CharacterCreationStep>) => {
      state.currentStep = action.payload;
      state.validationErrors = {};
    },
    setOrigins: (state, action: PayloadAction<OriginDefinition[]>) => {
      state.availableOrigins = action.payload;
    },
    setSkills: (state, action: PayloadAction<Skill[]>) => {
      state.availableSkills = action.payload;
    },
    updateFormData: (
      state,
      action: PayloadAction<Partial<CharacterCreationState['formData']>>
    ) => {
      state.formData = { ...state.formData, ...action.payload };
      state.validationErrors = {};
    },
    setValidationErrors: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.validationErrors = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setCreatedCharacterId: (state, action: PayloadAction<string | null>) => {
      state.createdCharacterId = action.payload;
    },
    reset: (state) => {
      state.currentStep = 'origin';
      state.formData = {
        name: '',
        origin: null,
        attributes: null,
        skillFocuses: [],
        appearance: null,
        isProtagonist: true,
      };
      state.validationErrors = {};
      state.isSubmitting = false;
      state.createdCharacterId = null;
    },
  },
});

export const {
  setStep,
  setOrigins,
  setSkills,
  updateFormData,
  setValidationErrors,
  setSubmitting,
  setCreatedCharacterId,
  reset,
} = characterCreationSlice.actions;

export default characterCreationSlice.reducer;

