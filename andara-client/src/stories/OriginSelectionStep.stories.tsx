import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { OriginSelectionStep } from '../components/character-creation/OriginSelectionStep';
import characterCreationReducer from '../store/slices/characterCreationSlice';
import type { CharacterCreationStep } from '../store/slices/characterCreationSlice';
import { Origin } from '../types/character';
import gameReducer from '../store/slices/gameSlice';
import partyReducer from '../store/slices/partySlice';
import worldReducer from '../store/slices/worldSlice';
import combatReducer from '../store/slices/combatSlice';
import uiReducer from '../store/slices/uiSlice';

const mockStore = configureStore({
  reducer: {
    game: gameReducer,
    party: partyReducer,
    world: worldReducer,
    combat: combatReducer,
    ui: uiReducer,
    characterCreation: characterCreationReducer,
  },
  preloadedState: {
    characterCreation: {
      currentStep: 'origin' as CharacterCreationStep,
      formData: {
        name: '',
        origin: null,
        attributes: null,
        skillFocuses: [],
        appearance: null,
        isProtagonist: true,
      },
      availableOrigins: [
        {
          id: 'VAULT_DWELLER',
          displayName: 'Vault Dweller',
          description: 'Sheltered from the Convergence in underground vaults',
        },
        {
          id: 'WASTELANDER',
          displayName: 'Wastelander',
          description: 'Survived the wastes through skill and determination',
        },
        {
          id: 'RIFT_TOUCHED',
          displayName: 'Rift-Touched',
          description: 'Altered by dimensional energy, sensitive to rifts',
        },
      ],
      availableSkills: [],
      validationErrors: {},
      isSubmitting: false,
      createdCharacterId: null,
    },
  },
});

const meta: Meta<typeof OriginSelectionStep> = {
  title: 'Character Creation/Origin Selection',
  component: OriginSelectionStep,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OriginSelectionStep>;

export const Default: Story = {};

export const WithSelection: Story = {
  decorators: [
    (Story) => {
      const store = configureStore({
        reducer: {
          game: gameReducer,
          party: partyReducer,
          world: worldReducer,
          combat: combatReducer,
          ui: uiReducer,
          characterCreation: characterCreationReducer,
        },
        preloadedState: {
          characterCreation: {
            currentStep: 'origin' as CharacterCreationStep,
            formData: {
              name: '',
              origin: Origin.VAULT_DWELLER,
              attributes: null,
              skillFocuses: [],
              appearance: null,
              isProtagonist: true,
            },
            availableOrigins: [
              {
                id: 'VAULT_DWELLER',
                displayName: 'Vault Dweller',
                description: 'Sheltered from the Convergence in underground vaults',
              },
              {
                id: 'WASTELANDER',
                displayName: 'Wastelander',
                description: 'Survived the wastes through skill and determination',
              },
              {
                id: 'RIFT_TOUCHED',
                displayName: 'Rift-Touched',
                description: 'Altered by dimensional energy, sensitive to rifts',
              },
            ],
            availableSkills: [],
            validationErrors: {},
            isSubmitting: false,
            createdCharacterId: null,
          },
        },
      });
      return (
        <Provider store={store}>
          <Story />
        </Provider>
      );
    },
  ],
};

