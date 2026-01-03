import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AttributeDistributionStep } from '../components/character-creation/AttributeDistributionStep';
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
      currentStep: 'attributes' as CharacterCreationStep,
      formData: {
        name: '',
        origin: Origin.VAULT_DWELLER,
        attributes: {
          strength: 8,
          agility: 8,
          endurance: 8,
          intellect: 8,
          perception: 8,
          charisma: 8,
        },
        skillFocuses: [],
        appearance: null,
        isProtagonist: true,
      },
      availableOrigins: [],
      availableSkills: [],
      validationErrors: {},
      isSubmitting: false,
      createdCharacterId: null,
    },
  },
});

const meta: Meta<typeof AttributeDistributionStep> = {
  title: 'Character Creation/Attribute Distribution',
  component: AttributeDistributionStep,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AttributeDistributionStep>;

export const Default: Story = {};

