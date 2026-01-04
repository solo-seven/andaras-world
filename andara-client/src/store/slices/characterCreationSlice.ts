import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  Origin,
  Attributes,
  Appearance,
  OriginDefinition,
  Skill,
} from '../../types/character';
import { startNewGame, retryWithBackoff } from '../../api/gameApi';
import { setGameIds } from './gameSlice';

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

/**
 * Async thunk to start a new game with character creation.
 * Includes retry logic with exponential backoff.
 */
export const startNewGameAsync = createAsyncThunk<
  { instanceId: string; partyId: string; characterId: string },
  void,
  { state: { characterCreation: CharacterCreationState } }
>(
  'characterCreation/startNewGame',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState().characterCreation;
    const { formData } = state;

    if (
      !formData.name ||
      !formData.origin ||
      !formData.attributes ||
      formData.skillFocuses.length !== 2 ||
      !formData.appearance
    ) {
      return rejectWithValue('Character data incomplete');
    }

    try {
      const response = await retryWithBackoff(async () => {
        return await startNewGame({
          name: formData.name,
          origin: formData.origin!,
          attributes: formData.attributes!,
          skillFocuses: formData.skillFocuses,
          appearance: formData.appearance!,
        });
      }, 3, 1000);

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create character');
      }

      // Store game IDs in game slice
      dispatch(
        setGameIds({
          instanceId: response.instanceId,
          partyId: response.partyId,
        })
      );

      return {
        instanceId: response.instanceId,
        partyId: response.partyId,
        characterId: response.characterId,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create character'
      );
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(startNewGameAsync.pending, (state) => {
        state.isSubmitting = true;
        state.validationErrors = {};
      })
      .addCase(startNewGameAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.createdCharacterId = action.payload.characterId;
        state.validationErrors = {};
      })
      .addCase(startNewGameAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.validationErrors = {
          submit:
            (action.payload as string) || 'Failed to create character. Please try again.',
        };
      });
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