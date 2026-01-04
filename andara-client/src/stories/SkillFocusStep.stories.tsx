import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { SkillFocusStep } from '../components/character-creation/SkillFocusStep';
import characterCreationReducer from '../store/slices/characterCreationSlice';
import type { CharacterCreationStep } from '../store/slices/characterCreationSlice';
import { Origin, Skill } from '../types/character';
import gameReducer from '../store/slices/gameSlice';
import partyReducer from '../store/slices/partySlice';
import worldReducer from '../store/slices/worldSlice';
import combatReducer from '../store/slices/combatSlice';
import uiReducer from '../store/slices/uiSlice';

// Mock skill data matching the mockup
const mockSkills: Skill[] = [
  // Combat
  {
    id: 'melee',
    name: 'Melee',
    category: 'combat',
    description:
      'Close combat with bladed and blunt weapons. Affects power attacks and ripostes.',
  },
  {
    id: 'ranged',
    name: 'Ranged',
    category: 'combat',
    description:
      'Firearms and projectiles. Improves accuracy and unlocks aimed shots.',
  },
  {
    id: 'unarmed',
    name: 'Unarmed',
    category: 'combat',
    description:
      'Hand-to-hand combat. Enables stunning blows and grappling.',
  },
  // Survival
  {
    id: 'scavenging',
    name: 'Scavenging',
    category: 'survival',
    description:
      'Finding resources in ruins. Improves loot quality and discovery rate.',
  },
  {
    id: 'tracking',
    name: 'Tracking',
    category: 'survival',
    description:
      'Following trails and hunting. Reveals enemy positions and predicts movement.',
  },
  {
    id: 'medicine',
    name: 'Medicine',
    category: 'survival',
    description:
      'Treating injuries and illness. Required for surgery and advanced healing.',
  },
  // Technical
  {
    id: 'mechanics',
    name: 'Mechanics',
    category: 'technical',
    description:
      'Repairing and building physical systems. Vehicles, weapons, structures.',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    category: 'technical',
    description:
      'Circuits, hacking, sensors. Enables tech weapon modding and system bypass.',
  },
  // Arcane
  {
    id: 'rift-manipulation',
    name: 'Rift Manipulation',
    category: 'arcane',
    description:
      'Direct energy control. Unlocks rift bolts, shields, and telekinesis.',
  },
  {
    id: 'wards',
    name: 'Wards',
    category: 'arcane',
    description:
      'Protective magic. Barriers, cleansing, and rift sealing abilities.',
  },
  // Social
  {
    id: 'barter',
    name: 'Barter',
    category: 'social',
    description:
      'Trading and negotiation. Improves prices and unlocks trade routes.',
  },
  {
    id: 'deception',
    name: 'Deception',
    category: 'social',
    description:
      'Lying and disguise. Enables bluffing and misdirection in dialogue.',
  },
];

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
        currentStep: 'skills' as CharacterCreationStep,
        formData: {
          name: '',
          origin: null,
          attributes: null,
          skillFocuses: [],
          appearance: null,
          isProtagonist: true,
        },
        availableOrigins: [],
        availableSkills: mockSkills,
        validationErrors: {},
        isSubmitting: false,
        createdCharacterId: null,
        ...preloadedState?.characterCreation,
      },
    },
  });
};

const meta: Meta<typeof SkillFocusStep> = {
  title: 'Character Creation/Skill Selection',
  component: SkillFocusStep,
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
type Story = StoryObj<typeof SkillFocusStep>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the component renders
    await expect(
      canvas.getByText('Select Starting Skills')
    ).toBeInTheDocument();

    // Verify all categories are displayed
    await expect(canvas.getByText('Combat')).toBeInTheDocument();
    await expect(canvas.getByText('Survival')).toBeInTheDocument();
    await expect(canvas.getByText('Technical')).toBeInTheDocument();
    await expect(canvas.getByText('Arcane')).toBeInTheDocument();
    await expect(canvas.getByText('Social')).toBeInTheDocument();

    // Verify selection count shows 0
    await expect(canvas.getByText(/0 \/ 2 focuses selected/)).toBeInTheDocument();

    // Verify Continue button is disabled
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeDisabled();
  },
};

export const WithOriginBonus: Story = {
  args: {
    characterCreation: {
      formData: {
        name: '',
        origin: Origin.WASTELANDER,
        attributes: null,
        skillFocuses: [],
        appearance: null,
        isProtagonist: true,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify origin bonus is mentioned in subtitle
    await expect(
      canvas.getByText(/Wastelander origin/i)
    ).toBeInTheDocument();

    // Verify Tracking skill shows Origin badge
    const trackingCard = canvas
      .getByText('Tracking')
      .closest('[role="button"]');
    await expect(trackingCard).toBeInTheDocument();
    await expect(canvas.getByText('Origin')).toBeInTheDocument();

    // Verify Tracking shows 15 → 20 proficiency
    await expect(canvas.getByText(/15 → 20/)).toBeInTheDocument();
  },
};

export const PartiallySelected: Story = {
  args: {
    characterCreation: {
      formData: {
        name: '',
        origin: null,
        attributes: null,
        skillFocuses: ['scavenging'],
        appearance: null,
        isProtagonist: true,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify selection count shows 1
    await expect(canvas.getByText(/1 \/ 2 focuses selected/)).toBeInTheDocument();

    // Verify Scavenging is selected
    const scavengingCard = canvas
      .getByText('Scavenging')
      .closest('[role="button"]');
    await expect(scavengingCard).toHaveAttribute('aria-pressed', 'true');

    // Verify selected skill tag is displayed
    await expect(canvas.getByText('Scavenging')).toBeInTheDocument();

    // Verify warning message is shown
    await expect(
      canvas.getByText(/Select 2 skill focuses to continue/i)
    ).toBeInTheDocument();

    // Verify Continue button is still disabled
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeDisabled();
  },
};

export const FullySelected: Story = {
  args: {
    characterCreation: {
      formData: {
        name: '',
        origin: null,
        attributes: null,
        skillFocuses: ['melee', 'barter'],
        appearance: null,
        isProtagonist: true,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify selection count shows 2
    await expect(canvas.getByText(/2 \/ 2 focuses selected/)).toBeInTheDocument();

    // Verify both skills are selected
    const meleeCard = canvas.getByText('Melee').closest('[role="button"]');
    const barterCard = canvas.getByText('Barter').closest('[role="button"]');
    await expect(meleeCard).toHaveAttribute('aria-pressed', 'true');
    await expect(barterCard).toHaveAttribute('aria-pressed', 'true');

    // Verify selected skill tags are displayed
    await expect(canvas.getByText('Melee')).toBeInTheDocument();
    await expect(canvas.getByText('Barter')).toBeInTheDocument();

    // Verify warning message is not shown
    expect(
      canvas.queryByText(/Select 2 skill focuses to continue/i)
    ).not.toBeInTheDocument();

    // Verify Continue button is enabled
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await expect(continueButton).not.toBeDisabled();
  },
};

export const MaxSelections: Story = {
  args: {
    characterCreation: {
      formData: {
        name: '',
        origin: null,
        attributes: null,
        skillFocuses: ['melee', 'barter'],
        appearance: null,
        isProtagonist: true,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Try to click a third skill (should be disabled)
    const rangedCard = canvas
      .getByText('Ranged')
      .closest('[role="button"]') as HTMLElement;
    
    // Verify it's not selected
    await expect(rangedCard).toHaveAttribute('aria-pressed', 'false');
    
    // Verify it has disabled class (visual check)
    await expect(rangedCard).toHaveClass(
      'andara-skill-focus-step__skill-card--disabled'
    );

    // Verify tabIndex is -1 (keyboard disabled)
    await expect(rangedCard).toHaveAttribute('tabIndex', '-1');
  },
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click on Melee
    const meleeCard = canvas
      .getByText('Melee')
      .closest('[role="button"]') as HTMLElement;
    await userEvent.click(meleeCard);

    // Wait for state update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify Melee is selected
    await expect(meleeCard).toHaveAttribute('aria-pressed', 'true');

    // Verify selection count updates
    await expect(canvas.getByText(/1 \/ 2 focuses selected/)).toBeInTheDocument();

    // Click on Barter
    const barterCard = canvas
      .getByText('Barter')
      .closest('[role="button"]') as HTMLElement;
    await userEvent.click(barterCard);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify both are selected
    await expect(meleeCard).toHaveAttribute('aria-pressed', 'true');
    await expect(barterCard).toHaveAttribute('aria-pressed', 'true');

    // Verify selection count shows 2
    await expect(canvas.getByText(/2 \/ 2 focuses selected/)).toBeInTheDocument();

    // Click Melee again to deselect
    await userEvent.click(meleeCard);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify Melee is deselected
    await expect(meleeCard).toHaveAttribute('aria-pressed', 'false');

    // Verify selection count shows 1
    await expect(canvas.getByText(/1 \/ 2 focuses selected/)).toBeInTheDocument();
  },
};

export const KeyboardNavigation: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the first skill card
    const firstCard = canvas
      .getByText('Melee')
      .closest('[role="button"]') as HTMLElement;

    // Focus on the first card
    firstCard.focus();
    await expect(firstCard).toHaveFocus();

    // Press Enter to select
    await userEvent.keyboard('{Enter}');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify it's selected
    await expect(firstCard).toHaveAttribute('aria-pressed', 'true');

    // Press Space on another card
    const secondCard = canvas
      .getByText('Ranged')
      .closest('[role="button"]') as HTMLElement;
    secondCard.focus();
    await userEvent.keyboard(' ');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify second card is selected
    await expect(secondCard).toHaveAttribute('aria-pressed', 'true');
  },
};

export const AllCategories: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all 5 categories are displayed
    await expect(canvas.getByText('Combat')).toBeInTheDocument();
    await expect(canvas.getByText('Survival')).toBeInTheDocument();
    await expect(canvas.getByText('Technical')).toBeInTheDocument();
    await expect(canvas.getByText('Arcane')).toBeInTheDocument();
    await expect(canvas.getByText('Social')).toBeInTheDocument();

    // Verify category descriptions
    await expect(
      canvas.getByText(/Violent encounters, weapon mastery/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/Endurance, resource gathering/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/Engineering, electronics/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/Rift energy manipulation/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/Influence, negotiation/i)
    ).toBeInTheDocument();

    // Verify skills in each category
    await expect(canvas.getByText('Melee')).toBeInTheDocument();
    await expect(canvas.getByText('Ranged')).toBeInTheDocument();
    await expect(canvas.getByText('Unarmed')).toBeInTheDocument();
    await expect(canvas.getByText('Scavenging')).toBeInTheDocument();
    await expect(canvas.getByText('Tracking')).toBeInTheDocument();
    await expect(canvas.getByText('Medicine')).toBeInTheDocument();
    await expect(canvas.getByText('Mechanics')).toBeInTheDocument();
    await expect(canvas.getByText('Electronics')).toBeInTheDocument();
    await expect(canvas.getByText('Rift Manipulation')).toBeInTheDocument();
    await expect(canvas.getByText('Wards')).toBeInTheDocument();
    await expect(canvas.getByText('Barter')).toBeInTheDocument();
    await expect(canvas.getByText('Deception')).toBeInTheDocument();
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

    // Verify current step (Skills) is marked as active
    const skillsStep = canvas.getByText('Skills').closest('.andara-stepper__step');
    await expect(skillsStep).toHaveClass('andara-stepper__step--active');
  },
};

export const ErrorState: Story = {
  args: {
    characterCreation: {
      formData: {
        name: '',
        origin: null,
        attributes: null,
        skillFocuses: ['melee'], // Only 1 selected, should show error
        appearance: null,
        isProtagonist: true,
      },
      validationErrors: {
        skills: 'Please select 2 skill focuses to continue',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify error message is displayed
    await expect(
      canvas.getByText(/Please select 2 skill focuses to continue/i)
    ).toBeInTheDocument();
  },
};

