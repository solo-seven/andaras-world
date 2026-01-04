import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../components/landing/LandingPage';

const meta = {
  title: 'Pages/LandingPage',
  component: LandingPage,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'void',
      values: [
        {
          name: 'void',
          value: '#0a0e14',
        },
      ],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHover: Story = {
  parameters: {
    pseudo: {
      hover: '.andara-button--primary',
    },
  },
};
