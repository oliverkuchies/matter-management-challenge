import type { Meta, StoryObj } from '@storybook/react';
import { MatterTable } from '../components/MatterTable';
import { mockMatters, createMockMatter } from '../mocks/mockData';
import { Matter } from '../types/matter';

const meta = {
  title: 'Components/MatterTable',
  component: MatterTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    sortBy: {
      control: 'select',
      options: ['created_at', 'updated_at', 'subject', 'Case Number', 'Status'],
    },
    sortOrder: {
      control: 'select',
      options: ['asc', 'desc'],
    },
  },
} satisfies Meta<typeof MatterTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with multiple matters
export const Default: Story = {
  args: {
    matters: mockMatters,
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSort: (column: string) => console.log('Sort by:', column),
  },
};

// Empty state
export const Empty: Story = {
  args: {
    matters: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSort: (column: string) => console.log('Sort by:', column),
  },
};

// Single matter
export const SingleMatter: Story = {
  args: {
    matters: [mockMatters[0]],
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSort: (column: string) => console.log('Sort by:', column),
  },
};

// Sorted by subject ascending
export const SortedBySubject: Story = {
  args: {
    matters: [...mockMatters].sort((a, b) => {
      const aSubject = a.fields['subject']?.displayValue || '';
      const bSubject = b.fields['subject']?.displayValue || '';
      return aSubject.localeCompare(bSubject);
    }),
    sortBy: 'subject',
    sortOrder: 'asc',
    onSort: (column: string) => console.log('Sort by:', column),
  },
};

// All SLA statuses
export const AllSLAStatuses: Story = {
  args: {
    matters: [
      createMockMatter({
        id: 'sla-in-progress',
        fields: {
          ...createMockMatter().fields,
          'subject': {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'SLA In Progress',
            displayValue: 'SLA In Progress',
          },
        },
        sla: 'In Progress',
        cycleTime: {
          resolutionTimeMs: 3600000,
          resolutionTimeFormatted: '1h 0m',
          isInProgress: true,
          startedAt: '2025-12-16T10:00:00.000Z',
          completedAt: null,
        },
      }),
      createMockMatter({
        id: 'sla-met',
        fields: {
          ...createMockMatter().fields,
          'subject': {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'SLA Met',
            displayValue: 'SLA Met',
          },
        },
        sla: 'Met',
        cycleTime: {
          resolutionTimeMs: 18000000, // 5 hours
          resolutionTimeFormatted: '5h 0m',
          isInProgress: false,
          startedAt: '2025-12-15T08:00:00.000Z',
          completedAt: '2025-12-15T13:00:00.000Z',
        },
      }),
      createMockMatter({
        id: 'sla-breached',
        fields: {
          ...createMockMatter().fields,
          'subject': {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'SLA Breached',
            displayValue: 'SLA Breached',
          },
        },
        sla: 'Breached',
        cycleTime: {
          resolutionTimeMs: 43200000, // 12 hours
          resolutionTimeFormatted: '12h 0m',
          isInProgress: false,
          startedAt: '2025-12-14T08:00:00.000Z',
          completedAt: '2025-12-14T20:00:00.000Z',
        },
      }),
    ],
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSort: (column: string) => console.log('Sort by:', column),
  },
};

// High priority urgent matters
export const HighPriorityUrgent: Story = {
  args: {
    matters: mockMatters.filter(
      (m) =>
        m.fields['Priority']?.displayValue === 'High' &&
        m.fields['Urgent']?.value === true
    ),
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSort: (column: string) => console.log('Sort by:', column),
  },
};

// Large contract values
export const LargeContracts: Story = {
  args: {
    matters: mockMatters.filter((m) => {
      const contractValue = m.fields['Contract Value']?.value as any;
      return contractValue && contractValue.amount >= 500000;
    }),
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSort: (column: string) => console.log('Sort by:', column),
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    matters: mockMatters,
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSort: (column: string) => {
      console.log('Sort clicked:', column);
      // In a real app, this would trigger state update
      alert(`Sort by: ${column}`);
    },
  },
};
