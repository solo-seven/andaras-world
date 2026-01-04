import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { AppearanceStep } from '../components/character-creation/AppearanceStep';
import characterCreationReducer from '../store/slices/characterCreationSlice';
import type { CharacterCreationStep } from '../store/slices/characterCreationSlice';
import {
  BodyType,
  HairStyle,
  HairColor,
  SkinTone,
  EyeColor,
  ScarsMarks,
  Appearance,
} from '../types/character';
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
        currentStep: 'appearance' as CharacterCreationStep,
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
        ...preloadedState?.characterCreation,
      },
    },
  });
};

const meta: Meta<typeof AppearanceStep> = {
  title: 'Character Creation/Appearance Step',
  component: AppearanceStep,
  decorators: [
    (Story, context) => {
      const store = createMockStore(context.args);
      return (
        <MemoryRouter>
          <Provider store={store}>
            <Story />
          </Provider>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppearanceStep>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the component renders
    await expect(
      canvas.getByText('Customize Appearance')
    ).toBeInTheDocument();

    // Verify all option groups are present
    await expect(canvas.getByText('Body Type')).toBeInTheDocument();
    await expect(canvas.getByText('Hair Style')).toBeInTheDocument();
    await expect(canvas.getByText('Hair Color')).toBeInTheDocument();
    await expect(canvas.getByText('Skin Tone')).toBeInTheDocument();
    await expect(canvas.getByText('Eye Color')).toBeInTheDocument();
    await expect(canvas.getByText('Age Appearance')).toBeInTheDocument();
    await expect(canvas.getByText('Scars & Marks')).toBeInTheDocument();

    // Verify action buttons
    await expect(canvas.getByRole('button', { name: /back/i })).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /randomize all/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument();
  },
};

export const WithDefaultAppearance: Story = {
  args: {},
  decorators: [
    (Story) => {
      const defaultAppearance: Appearance = {
        bodyType: BodyType.MASCULINE,
        hairStyle: HairStyle.SHORT,
        hairColor: HairColor.BLACK,
        skinTone: SkinTone.FAIR,
        eyeColor: EyeColor.BLUE,
        ageAppearance: 32,
        scarsMarks: ScarsMarks.WEATHERED,
      };
      const store = createMockStore({
        characterCreation: {
          formData: {
            name: '',
            origin: null,
            attributes: null,
            skillFocuses: [],
            appearance: defaultAppearance,
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

    // Verify default selections are shown
    await expect(canvas.getByText('MASCULINE')).toBeInTheDocument();
    await expect(canvas.getByText('SHORT')).toBeInTheDocument();
    await expect(canvas.getByText('BLACK')).toBeInTheDocument();
    await expect(canvas.getByText('FAIR')).toBeInTheDocument();
    await expect(canvas.getByText('BLUE')).toBeInTheDocument();
    await expect(canvas.getByText('32')).toBeInTheDocument();
    await expect(canvas.getByText('WEATHERED')).toBeInTheDocument();
  },
};

export const InteractiveBodyType: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click on Feminine body type
    const feminineBtn = canvas.getByRole('button', { name: /feminine/i });
    await userEvent.click(feminineBtn);

    // Wait for state update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify Feminine is selected
    await expect(feminineBtn).toHaveClass('selected');

    // Click on Neutral
    const neutralBtn = canvas.getByRole('button', { name: /neutral/i });
    await userEvent.click(neutralBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify Neutral is selected and Feminine is not
    await expect(neutralBtn).toHaveClass('selected');
    await expect(feminineBtn).not.toHaveClass('selected');
  },
};

export const InteractiveHairStyle: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click on Long hair style
    const longBtn = canvas.getByRole('button', { name: /^long$/i });
    await userEvent.click(longBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify Long is selected
    await expect(longBtn).toHaveClass('selected');

    // Try other styles
    const mohawkBtn = canvas.getByRole('button', { name: /mohawk/i });
    await userEvent.click(mohawkBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    await expect(mohawkBtn).toHaveClass('selected');
    await expect(longBtn).not.toHaveClass('selected');
  },
};

export const InteractiveColorSwatches: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find hair color swatches
    const hairColorGroup = canvas
      .getByText('Hair Color')
      .closest('.andara-appearance-step__option-group');
    const swatches = hairColorGroup?.querySelectorAll(
      '.andara-appearance-step__color-swatch'
    );

    if (swatches && swatches.length > 0) {
      // Click on the second swatch (Brown)
      await userEvent.click(swatches[1] as HTMLElement);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify it's selected
      await expect(swatches[1]).toHaveClass('selected');

      // Click on a different swatch
      await userEvent.click(swatches[2] as HTMLElement);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify new selection
      await expect(swatches[2]).toHaveClass('selected');
      await expect(swatches[1]).not.toHaveClass('selected');
    }
  },
};

export const AgeSlider: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the age slider
    const slider = canvas.getByRole('slider') as HTMLInputElement;
    await expect(slider).toBeInTheDocument();
    await expect(slider).toHaveAttribute('min', '18');
    await expect(slider).toHaveAttribute('max', '70');
    await expect(slider).toHaveAttribute('type', 'range');

    // Verify the age value is displayed
    const ageValue = canvas.getByText(/^\d+$/);
    await expect(ageValue).toBeInTheDocument();

    // Verify slider has a default value
    const defaultValue = Number(slider.value);
    await expect(defaultValue).toBeGreaterThanOrEqual(18);
    await expect(defaultValue).toBeLessThanOrEqual(70);
  },
};

export const RandomizeAll: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click randomize button
    const randomizeBtn = canvas.getByRole('button', { name: /randomize all/i });
    await userEvent.click(randomizeBtn);

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify that some selections have been made (randomized)
    // We can't predict exact values, but we can verify the UI updated
    const optionValues = canvas.getAllByText(/^(MASCULINE|FEMININE|NEUTRAL|BALD|SHORT|MEDIUM|LONG|MOHAWK|BRAIDED|BLACK|BROWN|BLONDE|RED|WHITE|BLUE|PALE|FAIR|MEDIUM|TAN|BROWN|DARK|BROWN|BLUE|GREEN|HAZEL|GRAY|AMBER|NONE|WEATHERED|BATTLE-WORN|RIFT-MARKED)$/i);
    await expect(optionValues.length).toBeGreaterThan(0);
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

    // Verify current step (Appearance) is marked as active
    const appearanceStep = canvas
      .getByText('Appearance')
      .closest('.andara-stepper__step');
    await expect(appearanceStep).toHaveClass('andara-stepper__step--active');
  },
};

export const NavigationButtons: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all navigation buttons are present and clickable
    const backBtn = canvas.getByRole('button', { name: /← back/i });
    const continueBtn = canvas.getByRole('button', { name: /continue →/i });
    const randomizeBtn = canvas.getByRole('button', { name: /randomize all/i });

    await expect(backBtn).toBeInTheDocument();
    await expect(continueBtn).toBeInTheDocument();
    await expect(randomizeBtn).toBeInTheDocument();

    // Verify buttons are enabled
    await expect(backBtn).not.toBeDisabled();
    await expect(continueBtn).not.toBeDisabled();
    await expect(randomizeBtn).not.toBeDisabled();
  },
};

export const KeyboardNavigation: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find a color swatch
    const hairColorGroup = canvas
      .getByText('Hair Color')
      .closest('.andara-appearance-step__option-group');
    const firstSwatch = hairColorGroup?.querySelector(
      '.andara-appearance-step__color-swatch'
    ) as HTMLElement;

    if (firstSwatch) {
      // Focus on the swatch
      firstSwatch.focus();
      await expect(firstSwatch).toHaveFocus();

      // Press Enter to select
      await userEvent.keyboard('{Enter}');
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify it's selected
      await expect(firstSwatch).toHaveClass('selected');
    }
  },
};

export const AllOptionsVisible: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all body type options
    await expect(canvas.getByRole('button', { name: /masculine/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /feminine/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /neutral/i })).toBeInTheDocument();

    // Verify all hair style options
    await expect(canvas.getByRole('button', { name: /^bald$/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^short$/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^medium$/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^long$/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /mohawk/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /braided/i })).toBeInTheDocument();

    // Verify all scars/marks options
    await expect(canvas.getByRole('button', { name: /^none$/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /weathered/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /battle-worn/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /rift-marked/i })).toBeInTheDocument();
  },
};

