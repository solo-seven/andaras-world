import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { OriginSelectionStep } from '../components/character-creation/OriginSelectionStep';
import characterCreationReducer from '../store/slices/characterCreationSlice';
import type { CharacterCreationStep } from '../store/slices/characterCreationSlice';
import { Origin, OriginDefinition } from '../types/character';
import gameReducer from '../store/slices/gameSlice';
import partyReducer from '../store/slices/partySlice';
import worldReducer from '../store/slices/worldSlice';
import combatReducer from '../store/slices/combatSlice';
import uiReducer from '../store/slices/uiSlice';

// Mock origin data matching the mockup
const mockOrigins: OriginDefinition[] = [
  {
    id: Origin.VAULT_DWELLER,
    displayName: 'Vault Dweller',
    description:
      'Raised in underground shelters with pre-Convergence technology. You understand machines but the wasteland is foreign.',
    icon: '⚙',
    bonuses: ['+Tech Skills'],
    penalties: ['-Survival Skills'],
    startingGear: 'Good Quality',
    stats: [
      { label: 'Bonus', value: '+Tech Skills', type: 'positive' },
      { label: 'Starting Gear', value: 'Good Quality', type: 'neutral' },
      { label: 'Penalty', value: '-Survival Skills', type: 'negative' },
    ],
  },
  {
    id: Origin.WASTELANDER,
    displayName: 'Wastelander',
    description:
      'Born in the ruins. You know how to find food, track prey, and survive where others perish.',
    icon: '☢',
    bonuses: ['+Survival', '+Scavenging'],
    penalties: ['-Tech Knowledge'],
    factionRelationships: { Nomad: 10 },
    stats: [
      { label: 'Bonus', value: '+Survival, +Scavenging', type: 'positive' },
      { label: 'Faction', value: 'Nomad +10', type: 'neutral' },
      { label: 'Penalty', value: '-Tech Knowledge', type: 'negative' },
    ],
  },
  {
    id: Origin.RIFT_TOUCHED,
    displayName: 'Rift-Touched',
    description:
      'Exposed to dimensional energy. You sense rifts and manipulate their power, but society fears you.',
    icon: '◈',
    bonuses: ['+Arcane Skills'],
    penalties: ['Health -10%', 'Social -15'],
    specialAbilities: ['Rift Perception'],
    stats: [
      { label: 'Bonus', value: '+Arcane Skills', type: 'positive' },
      { label: 'Special', value: 'Rift Perception', type: 'neutral' },
      { label: 'Penalty', value: 'Health -10%, Social -15', type: 'negative' },
    ],
  },
  {
    id: Origin.CARAVAN_GUARD,
    displayName: 'Caravan Guard',
    description:
      'Protected traders across dangerous territories. You know combat, trade routes, and negotiation.',
    icon: '⚖',
    bonuses: ['+Combat', '+Barter'],
    factionRelationships: { Merchants: 15 },
    stats: [
      { label: 'Bonus', value: '+Combat, +Barter', type: 'positive' },
      { label: 'Faction', value: 'Merchants +15', type: 'neutral' },
      { label: 'Trade-off', value: 'Narrow Skill Base', type: 'neutral' },
    ],
  },
  {
    id: Origin.SETTLEMENT_MILITIA,
    displayName: 'Settlement Militia',
    description:
      'Defended your home from raiders and rifts. Trained in tactics and ranged combat, loyal to your settlement.',
    icon: '⚔',
    bonuses: ['+Ranged', '+Tactics'],
    penalties: ['-Mobility Skills'],
    factionRelationships: { 'Home Settlement': 20 },
    stats: [
      { label: 'Bonus', value: '+Ranged, +Tactics', type: 'positive' },
      { label: 'Faction', value: 'Home Settlement +20', type: 'neutral' },
      { label: 'Penalty', value: '-Mobility Skills', type: 'negative' },
    ],
  },
  {
    id: Origin.OUTCAST,
    displayName: 'Outcast',
    description:
      'Exiled or fled from your community. You learned to survive alone through stealth and cunning.',
    icon: '☠',
    bonuses: ['+Stealth', '+Deception'],
    penalties: ['Most Factions -10'],
    specialAbilities: ['Solo Survivor'],
    stats: [
      { label: 'Bonus', value: '+Stealth, +Deception', type: 'positive' },
      { label: 'Special', value: 'Solo Survivor', type: 'neutral' },
      { label: 'Penalty', value: 'Most Factions -10', type: 'negative' },
    ],
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
        currentStep: 'origin' as CharacterCreationStep,
        formData: {
          name: '',
          origin: null,
          attributes: null,
          skillFocuses: [],
          appearance: null,
          isProtagonist: true,
        },
        availableOrigins: mockOrigins,
        availableSkills: [],
        validationErrors: {},
        isSubmitting: false,
        createdCharacterId: null,
        ...preloadedState?.characterCreation,
      },
    },
  });
};

const meta: Meta<typeof OriginSelectionStep> = {
  title: 'Character Creation/Origin Selection',
  component: OriginSelectionStep,
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
type Story = StoryObj<typeof OriginSelectionStep>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify the component renders
    await expect(canvas.getByText('Choose Your Origin')).toBeInTheDocument();
    
    // Verify all 6 origins are displayed
    await expect(canvas.getByText('Vault Dweller')).toBeInTheDocument();
    await expect(canvas.getByText('Wastelander')).toBeInTheDocument();
    await expect(canvas.getByText('Rift-Touched')).toBeInTheDocument();
    await expect(canvas.getByText('Caravan Guard')).toBeInTheDocument();
    await expect(canvas.getByText('Settlement Militia')).toBeInTheDocument();
    await expect(canvas.getByText('Outcast')).toBeInTheDocument();
    
    // Verify Continue button is disabled when no origin is selected
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeDisabled();
  },
};

export const WithSelection: Story = {
  args: {
    characterCreation: {
      formData: {
        origin: Origin.WASTELANDER,
      },
    },
  },
  decorators: [
    (Story) => {
      const store = createMockStore({
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
    
    // Verify Wastelander is selected
    const wastelanderCard = canvas.getByText('Wastelander').closest('[role="button"]');
    await expect(wastelanderCard).toHaveAttribute('aria-pressed', 'true');
    
    // Verify selection summary shows Wastelander
    await expect(canvas.getByText(/Selected:.*Wastelander/i)).toBeInTheDocument();
    
    // Verify Continue button is enabled
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await expect(continueButton).not.toBeDisabled();
  },
};

export const AllOrigins: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify all origin cards are present and clickable
    const origins = [
      'Vault Dweller',
      'Wastelander',
      'Rift-Touched',
      'Caravan Guard',
      'Settlement Militia',
      'Outcast',
    ];
    
    for (const originName of origins) {
      const originCard = canvas.getByText(originName).closest('[role="button"]');
      await expect(originCard).toBeInTheDocument();
      await expect(originCard).toHaveAttribute('aria-label', expect.stringContaining(originName));
    }
  },
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Click on Vault Dweller
    const vaultDwellerCard = canvas
      .getByText('Vault Dweller')
      .closest('[role="button"]') as HTMLElement;
    await userEvent.click(vaultDwellerCard);
    
    // Wait a bit for state update
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Verify Vault Dweller is selected
    await expect(vaultDwellerCard).toHaveAttribute('aria-pressed', 'true');
    
    // Verify selection summary updates
    await expect(canvas.getByText(/Selected:.*Vault Dweller/i)).toBeInTheDocument();
    
    // Click on a different origin
    const wastelanderCard = canvas
      .getByText('Wastelander')
      .closest('[role="button"]') as HTMLElement;
    await userEvent.click(wastelanderCard);
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Verify Wastelander is now selected and Vault Dweller is not
    await expect(wastelanderCard).toHaveAttribute('aria-pressed', 'true');
    await expect(vaultDwellerCard).toHaveAttribute('aria-pressed', 'false');
    
    // Verify Continue button is enabled
    const continueButton = canvas.getByRole('button', { name: /continue/i });
    await expect(continueButton).not.toBeDisabled();
  },
};

export const KeyboardNavigation: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find the first origin card
    const firstCard = canvas
      .getByText('Vault Dweller')
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
      .getByText('Wastelander')
      .closest('[role="button"]') as HTMLElement;
    secondCard.focus();
    await userEvent.keyboard(' ');
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Verify second card is selected
    await expect(secondCard).toHaveAttribute('aria-pressed', 'true');
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
    
    // Verify current step (Origin) is marked as active
    const originStep = canvas.getByText('Origin').closest('.andara-stepper__step');
    await expect(originStep).toHaveClass('andara-stepper__step--active');
  },
};

export const ErrorState: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createMockStore({
        characterCreation: {
          validationErrors: {
            origin: 'Please select an origin',
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
    
    // Verify error message is displayed
    await expect(canvas.getByText('Please select an origin')).toBeInTheDocument();
  },
};
