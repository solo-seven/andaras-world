import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AttributeDistributionStep } from '../components/character-creation/AttributeDistributionStep';
import characterCreationReducer from '../store/slices/characterCreationSlice';
import type { CharacterCreationStep } from '../store/slices/characterCreationSlice';
import { Origin, Attributes } from '../types/character';
import gameReducer from '../store/slices/gameSlice';
import partyReducer from '../store/slices/partySlice';
import worldReducer from '../store/slices/worldSlice';
import combatReducer from '../store/slices/combatSlice';
import uiReducer from '../store/slices/uiSlice';

const createMockStore = (preloadedState?: any) => {
  return configureStore({
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
          attributes: null,
          skillFocuses: [],
          appearance: null,
          isProtagonist: true,
          ...preloadedState?.characterCreation?.formData,
        },
        availableOrigins: [],
        availableSkills: [],
        validationErrors: {},
        isSubmitting: false,
        createdCharacterId: null,
        ...preloadedState?.characterCreation,
      },
    },
  });
};

const meta: Meta<typeof AttributeDistributionStep> = {
  title: 'Character Creation/Attribute Distribution',
  component: AttributeDistributionStep,
  decorators: [
    (Story, context) => {
      const store = createMockStore(context.args);
      return (
        <Provider store={store}>
          <Story />
        </Provider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AttributeDistributionStep>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the component renders
    await expect(canvas.getByText('Distribute Attributes')).toBeInTheDocument();

    // Verify all 6 attributes are displayed
    await expect(canvas.getByText('Strength')).toBeInTheDocument();
    await expect(canvas.getByText('Agility')).toBeInTheDocument();
    await expect(canvas.getByText('Endurance')).toBeInTheDocument();
    await expect(canvas.getByText('Intellect')).toBeInTheDocument();
    await expect(canvas.getByText('Perception')).toBeInTheDocument();
    await expect(canvas.getByText('Charisma')).toBeInTheDocument();

    // Verify points remaining shows 27 (all attributes at base 8)
    await expect(canvas.getByText(/27.*points remaining/i)).toBeInTheDocument();

    // Verify Continue button is disabled when points remain
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeDisabled();
  },
};

export const WithAllocatedPoints: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createMockStore({
        characterCreation: {
          formData: {
            name: '',
            origin: Origin.VAULT_DWELLER,
            attributes: {
              strength: 10,
              agility: 11,
              endurance: 9,
              intellect: 8,
              perception: 8,
              charisma: 8,
            } as Attributes,
            skillFocuses: [],
            appearance: null,
            isProtagonist: true,
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify attributes show the allocated values
    const strengthValue = canvas.getByLabelText(/strength attribute/i);
    await expect(strengthValue).toHaveValue(10);

    const agilityValue = canvas.getByLabelText(/agility attribute/i);
    await expect(agilityValue).toHaveValue(11);

    // Verify points remaining is updated (27 - (2+3+1) = 21)
    await expect(canvas.getByText(/21.*points remaining/i)).toBeInTheDocument();
  },
};

export const ValidationError: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Try to continue without allocating all points
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await userEvent.click(continueButton);

    // Wait for validation error
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify warning message is shown
    await expect(
      canvas.getByText(/you must spend all.*points/i)
    ).toBeInTheDocument();
  },
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the Strength slider
    const strengthSlider = canvas.getByLabelText(/strength attribute/i) as HTMLInputElement;

    // Verify initial value is 8
    await expect(strengthSlider).toHaveValue(8);

    // Move slider to 10
    await userEvent.clear(strengthSlider);
    await userEvent.type(strengthSlider, '10');

    // Wait for state update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify value updated
    await expect(strengthSlider).toHaveValue(10);

    // Verify points remaining decreased (27 - 2 = 25)
    await expect(canvas.getByText(/25.*points remaining/i)).toBeInTheDocument();
  },
};

export const DerivedStatsUpdate: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify derived stats are displayed
    await expect(canvas.getByText('Derived Statistics')).toBeInTheDocument();
    await expect(canvas.getByText(/Max Health/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Max Stamina/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Carry Weight/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Initiative Bonus/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Base Action Points/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Critical Chance/i)).toBeInTheDocument();

    // With all attributes at 8:
    // Max Health = 50 + (8 * 10) = 130
    // Max Stamina = 40 + (8 * 8) + (8 * 3) = 40 + 64 + 24 = 128
    // Carry Weight = 50 + (8 * 6) = 98
    // Initiative = floor(8 / 3) = 2
    // Crit Chance = 5 + floor(8 / 4) = 7

    await expect(canvas.getByText('130')).toBeInTheDocument(); // Max Health
    await expect(canvas.getByText('128')).toBeInTheDocument(); // Max Stamina
    await expect(canvas.getByText(/98.*kg/i)).toBeInTheDocument(); // Carry Weight
    await expect(canvas.getByText('+2')).toBeInTheDocument(); // Initiative
    await expect(canvas.getByText('7%')).toBeInTheDocument(); // Crit Chance

    // Change Endurance to 10
    const enduranceSlider = canvas.getByLabelText(/endurance attribute/i) as HTMLInputElement;
    await userEvent.clear(enduranceSlider);
    await userEvent.type(enduranceSlider, '10');

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify Max Health updated: 50 + (10 * 10) = 150
    await expect(canvas.getByText('150')).toBeInTheDocument();
  },
};

export const KeyboardNavigation: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the Strength slider
    const strengthSlider = canvas.getByLabelText(/strength attribute/i) as HTMLInputElement;

    // Focus on the slider
    strengthSlider.focus();
    await expect(strengthSlider).toHaveFocus();

    // Use arrow keys to increase value
    await userEvent.keyboard('{ArrowRight}');
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify value increased (from 8 to 9)
    await expect(strengthSlider).toHaveValue(9);

    // Use arrow keys to decrease value
    await userEvent.keyboard('{ArrowLeft}');
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify value decreased (back to 8)
    await expect(strengthSlider).toHaveValue(8);
  },
};

export const MinMaxValues: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const strengthSlider = canvas.getByLabelText(/strength attribute/i) as HTMLInputElement;

    // Set to minimum (6)
    await userEvent.clear(strengthSlider);
    await userEvent.type(strengthSlider, '6');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(strengthSlider).toHaveValue(6);

    // Set to maximum (16)
    await userEvent.clear(strengthSlider);
    await userEvent.type(strengthSlider, '16');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(strengthSlider).toHaveValue(16);

    // Verify points remaining updated
    // At 6: gives back 2 points (8-6=2), so 27 + 2 = 29 remaining
    // At 16: uses 8 points (16-8=8), so 27 - 8 = 19 remaining
    await expect(canvas.getByText(/19.*points remaining/i)).toBeInTheDocument();
  },
};

export const StepperDisplay: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify stepper is displayed
    await expect(canvas.getByText('Origin')).toBeInTheDocument();
    await expect(canvas.getByText('Attributes')).toBeInTheDocument();
    await expect(canvas.getByText('Skills')).toBeInTheDocument();
    await expect(canvas.getByText('Appearance')).toBeInTheDocument();
    await expect(canvas.getByText('Identity')).toBeInTheDocument();

    // Verify current step (Attributes) is marked as active
    const attributesStep = canvas.getByText('Attributes').closest('.andara-stepper__step');
    await expect(attributesStep).toHaveClass('andara-stepper__step--active');

    // Verify Origin step is completed
    const originStep = canvas.getByText('Origin').closest('.andara-stepper__step');
    await expect(originStep).toHaveClass('andara-stepper__step--completed');
  },
};

export const TipsPanel: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify tips panel is displayed
    await expect(canvas.getByText('Build Tips')).toBeInTheDocument();

    // Verify default tips are shown
    await expect(
      canvas.getByText(/Wastelanders benefit from high END and PER/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/16\+ in any attribute grants special bonuses/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/Balanced builds are viable/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/Low CHA makes trading more expensive/i)
    ).toBeInTheDocument();
  },
};

export const FullyAllocated: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createMockStore({
        characterCreation: {
          formData: {
            name: '',
            origin: Origin.VAULT_DWELLER,
            attributes: {
              strength: 13,
              agility: 13,
              endurance: 14,
              intellect: 14,
              perception: 14,
              charisma: 7,
            } as Attributes,
            skillFocuses: [],
            appearance: null,
            isProtagonist: true,
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify points remaining is 0
    // Calculation: (13-8) + (13-8) + (14-8) + (14-8) + (14-8) + (7-8)
    // = 5 + 5 + 6 + 6 + 6 - 1 = 27 points used exactly
    await expect(canvas.getByText(/0.*points remaining/i)).toBeInTheDocument();

    // Verify Continue button is enabled
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await expect(continueButton).not.toBeDisabled();

    // Verify warning is not shown
    const warning = canvas.queryByText(/you must spend all points/i);
    await expect(warning).not.toBeInTheDocument();
  },
};
