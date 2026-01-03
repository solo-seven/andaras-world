import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CharacterCreationWizard } from '../components/character-creation/CharacterCreationWizard';
import characterCreationReducer from '../store/slices/characterCreationSlice';
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
});

const meta: Meta<typeof CharacterCreationWizard> = {
  title: 'Character Creation/Wizard',
  component: CharacterCreationWizard,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CharacterCreationWizard>;

export const Default: Story = {};

