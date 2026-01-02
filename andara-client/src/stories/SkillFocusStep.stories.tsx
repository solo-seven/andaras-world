import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SkillFocusStep } from '../components/character-creation/SkillFocusStep';
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
      currentStep: 'skills' as CharacterCreationStep,
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
        skillFocuses: [],
        appearance: null,
        isProtagonist: true,
      },
      availableOrigins: [],
      availableSkills: [
        { id: 'mechanics', name: 'Mechanics', category: 'TECHNICAL', description: 'Physical construction and repair' },
        { id: 'electronics', name: 'Electronics', category: 'TECHNICAL', description: 'Circuits, hacking, sensors' },
        { id: 'scavenging', name: 'Scavenging', category: 'SURVIVAL', description: 'Finding resources' },
        { id: 'tracking', name: 'Tracking', category: 'SURVIVAL', description: 'Following trails and hunting' },
        { id: 'melee', name: 'Melee', category: 'COMBAT', description: 'Close combat with weapons' },
        { id: 'ranged', name: 'Ranged', category: 'COMBAT', description: 'Firearms and thrown weapons' },
      ],
      validationErrors: {},
      isSubmitting: false,
      createdCharacterId: null,
    },
  },
});

const meta: Meta<typeof SkillFocusStep> = {
  title: 'Character Creation/Skill Focus',
  component: SkillFocusStep,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SkillFocusStep>;

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
            currentStep: 'skills' as CharacterCreationStep,
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
              appearance: null,
              isProtagonist: true,
            },
            availableOrigins: [],
            availableSkills: [
              { id: 'mechanics', name: 'Mechanics', category: 'TECHNICAL', description: 'Physical construction and repair' },
              { id: 'electronics', name: 'Electronics', category: 'TECHNICAL', description: 'Circuits, hacking, sensors' },
              { id: 'scavenging', name: 'Scavenging', category: 'SURVIVAL', description: 'Finding resources' },
            ],
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

