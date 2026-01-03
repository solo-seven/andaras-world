import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppearanceStep } from '../components/character-creation/AppearanceStep';
import characterCreationReducer from '../store/slices/characterCreationSlice';
import type { CharacterCreationStep } from '../store/slices/characterCreationSlice';
import { Origin } from '../types/character';
import gameReducer from '../store/slices/gameSlice';
import partyReducer from '../store/slices/partySlice';
import worldReducer from '../store/slices/worldSlice';
import combatReducer from '../store/slices/combatSlice';
import uiReducer from '../store/slices/uiSlice';
import { Gender, BodyType } from '../types/character';

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
      currentStep: 'appearance' as CharacterCreationStep,
      formData: {
        name: '',
        origin: Origin.VAULT_DWELLER,
        attributes: {
          strength: 10,
          agility: 9,
          endurance: 8,
          intellect: 8,
          perception: 8,
          charisma: 8,
        },
        skillFocuses: ['mechanics', 'electronics'],
        appearance: {
          gender: Gender.NON_BINARY,
          bodyType: BodyType.AVERAGE,
        },
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

const meta: Meta<typeof AppearanceStep> = {
  title: 'Character Creation/Appearance',
  component: AppearanceStep,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppearanceStep>;

export const Default: Story = {};

