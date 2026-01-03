import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NameStep } from '../components/character-creation/NameStep';
import characterCreationReducer from '../store/slices/characterCreationSlice';
import type { CharacterCreationStep } from '../store/slices/characterCreationSlice';
import { Origin, Gender, BodyType } from '../types/character';
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
      currentStep: 'name' as CharacterCreationStep,
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

const meta: Meta<typeof NameStep> = {
  title: 'Character Creation/Name',
  component: NameStep,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NameStep>;

export const Default: Story = {};

export const WithName: Story = {
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
            currentStep: 'name' as CharacterCreationStep,
            formData: {
              name: 'Test Character',
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
      return (
        <Provider store={store}>
          <Story />
        </Provider>
      );
    },
  ],
};

