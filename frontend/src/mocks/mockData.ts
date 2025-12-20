import { Matter, MatterListResponse, CurrencyValue, UserValue, StatusValue } from '../types/matter';

// Mock users
export const mockUsers = {
  alice: {
    id: 1,
    email: 'alice.brown@example.com',
    firstName: 'Alice',
    lastName: 'Brown',
    displayName: 'Alice Brown',
  } as UserValue,
  jane: {
    id: 2,
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    displayName: 'Jane Smith',
  } as UserValue,
  bob: {
    id: 3,
    email: 'bob.johnson@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    displayName: 'Bob Johnson',
  } as UserValue,
  carol: {
    id: 4,
    email: 'carol.white@example.com',
    firstName: 'Carol',
    lastName: 'White',
    displayName: 'Carol White',
  } as UserValue,
  david: {
    id: 5,
    email: 'david.lee@example.com',
    firstName: 'David',
    lastName: 'Lee',
    displayName: 'David Lee',
  } as UserValue,
};

// Mock status values
export const mockStatuses = {
  toDo: {
    statusId: 'status-1',
    groupName: 'Backlog',
    label: 'To Do',
  } as StatusValue,
  inProgress: {
    statusId: 'status-2',
    groupName: 'Active',
    label: 'In Progress',
  } as StatusValue,
  done: {
    statusId: 'status-3',
    groupName: 'Complete',
    label: 'Done',
  } as StatusValue,
};

// Helper function to create a mock matter
export function createMockMatter(overrides: Partial<Matter> = {}): Matter {
  const baseId = Math.random().toString(36).substring(7);

  return {
    id: `matter-${baseId}`,
    boardId: 'board-123',
    fields: {
      subject: {
        fieldId: 'field-1',
        fieldName: 'subject',
        fieldType: 'text',
        value: 'Contract Review',
        displayValue: 'Contract Review',
      },
      'case number': {
        fieldId: 'field-2',
        fieldName: 'case number',
        fieldType: 'number',
        value: 1000,
        displayValue: '1,000',
      },
      status: {
        fieldId: 'field-3',
        fieldName: 'status',
        fieldType: 'status',
        value: mockStatuses.inProgress,
        displayValue: 'In Progress',
      },
      'assigned to': {
        fieldId: 'field-4',
        fieldName: 'assigned to',
        fieldType: 'user',
        value: mockUsers.alice,
        displayValue: 'Alice Brown',
      },
      priority: {
        fieldId: 'field-5',
        fieldName: 'priority',
        fieldType: 'select',
        value: 'medium',
        displayValue: 'Medium',
      },
      'contract value': {
        fieldId: 'field-6',
        fieldName: 'contract value',
        fieldType: 'currency',
        value: { amount: 50000, currency: 'USD' } as CurrencyValue,
        displayValue: '50,000 USD',
      },
      'due date': {
        fieldId: 'field-7',
        fieldName: 'due date',
        fieldType: 'date',
        value: '2025-12-31T00:00:00.000Z',
        displayValue: '12/31/2025',
      },
      urgent: {
        fieldId: 'field-8',
        fieldName: 'urgent',
        fieldType: 'boolean',
        value: false,
        displayValue: '✗',
      },
    },
    cycleTime: {
      resolutionTimeMs: 7200000, // 2 hours
      resolutionTimeFormatted: '2h 0m',
      isInProgress: true,
      startedAt: '2025-12-15T10:00:00.000Z',
      completedAt: null,
    },
    sla: 'In Progress',
    createdAt: '2025-12-15T09:00:00.000Z',
    updatedAt: '2025-12-15T10:00:00.000Z',
    ...overrides,
  };
}

// Pre-defined mock matters with different scenarios
export const mockMatters: Matter[] = [
  createMockMatter({
    id: 'matter-1',
    fields: {
      subject: {
        fieldId: 'field-1',
        fieldName: 'subject',
        fieldType: 'text',
        value: 'Patent Application Review',
        displayValue: 'Patent Application Review',
      },
      'case number': {
        fieldId: 'field-2',
        fieldName: 'case number',
        fieldType: 'number',
        value: 1001,
        displayValue: '1,001',
      },
      status: {
        fieldId: 'field-3',
        fieldName: 'status',
        fieldType: 'status',
        value: mockStatuses.done,
        displayValue: 'Done',
      },
      'assigned to': {
        fieldId: 'field-4',
        fieldName: 'assigned to',
        fieldType: 'user',
        value: mockUsers.alice,
        displayValue: 'Alice Brown',
      },
      priority: {
        fieldId: 'field-5',
        fieldName: 'priority',
        fieldType: 'select',
        value: 'high',
        displayValue: 'High',
      },
      'contract value': {
        fieldId: 'field-6',
        fieldName: 'contract value',
        fieldType: 'currency',
        value: { amount: 150000, currency: 'USD' } as CurrencyValue,
        displayValue: '150,000 USD',
      },
      'due date': {
        fieldId: 'field-7',
        fieldName: 'due date',
        fieldType: 'date',
        value: '2025-12-20T00:00:00.000Z',
        displayValue: '12/20/2025',
      },
      urgent: {
        fieldId: 'field-8',
        fieldName: 'Urgent',
        fieldType: 'boolean',
        value: true,
        displayValue: '✓',
      },
    },
    cycleTime: {
      resolutionTimeMs: 21600000, // 6 hours
      resolutionTimeFormatted: '6h 0m',
      isInProgress: false,
      startedAt: '2025-12-14T08:00:00.000Z',
      completedAt: '2025-12-14T14:00:00.000Z',
    },
    sla: 'Met',
  }),
  createMockMatter({
    id: 'matter-2',
    fields: {
      subject: {
        fieldId: 'field-1',
        fieldName: 'subject',
        fieldType: 'text',
        value: 'Corporate Merger Agreement',
        displayValue: 'Corporate Merger Agreement',
      },
      'case number': {
        fieldId: 'field-2',
        fieldName: 'case number',
        fieldType: 'number',
        value: 1002,
        displayValue: '1,002',
      },
      status: {
        fieldId: 'field-3',
        fieldName: 'status',
        fieldType: 'status',
        value: mockStatuses.inProgress,
        displayValue: 'In Progress',
      },
      'assigned to': {
        fieldId: 'field-4',
        fieldName: 'assigned to',
        fieldType: 'user',
        value: mockUsers.bob,
        displayValue: 'Bob Johnson',
      },
      priority: {
        fieldId: 'field-5',
        fieldName: 'priority',
        fieldType: 'select',
        value: 'high',
        displayValue: 'High',
      },
      'contract value': {
        fieldId: 'field-6',
        fieldName: 'contract value',
        fieldType: 'currency',
        value: { amount: 500000, currency: 'USD' } as CurrencyValue,
        displayValue: '500,000 USD',
      },
      'due date': {
        fieldId: 'field-7',
        fieldName: 'due date',
        fieldType: 'date',
        value: '2026-01-15T00:00:00.000Z',
        displayValue: '1/15/2026',
      },
      urgent: {
        fieldId: 'field-8',
        fieldName: 'urgent',
        fieldType: 'boolean',
        value: true,
        displayValue: '✓',
      },
    },
    cycleTime: {
      resolutionTimeMs: 36000000, // 10 hours
      resolutionTimeFormatted: '10h 0m',
      isInProgress: true,
      startedAt: '2025-12-10T09:00:00.000Z',
      completedAt: null,
    },
    sla: 'Breached',
  }),
  createMockMatter({
    id: 'matter-3',
    fields: {
      subject: {
        fieldId: 'field-1',
        fieldName: 'subject',
        fieldType: 'text',
        value: 'Trademark Registration',
        displayValue: 'Trademark Registration',
      },
      'case number': {
        fieldId: 'field-2',
        fieldName: 'case number',
        fieldType: 'number',
        value: 1003,
        displayValue: '1,003',
      },
      status: {
        fieldId: 'field-3',
        fieldName: 'status',
        fieldType: 'status',
        value: mockStatuses.toDo,
        displayValue: 'To Do',
      },
      'assigned to': {
        fieldId: 'field-4',
        fieldName: 'assigned to',
        fieldType: 'user',
        value: mockUsers.jane,
        displayValue: 'Jane Smith',
      },
      priority: {
        fieldId: 'field-5',
        fieldName: 'priority',
        fieldType: 'select',
        value: 'low',
        displayValue: 'Low',
      },
      'contract value': {
        fieldId: 'field-6',
        fieldName: 'contract value',
        fieldType: 'currency',
        value: { amount: 25000, currency: 'USD' } as CurrencyValue,
        displayValue: '25,000 USD',
      },
      'due date': {
        fieldId: 'field-7',
        fieldName: 'due date',
        fieldType: 'date',
        value: '2026-02-28T00:00:00.000Z',
        displayValue: '2/28/2026',
      },
      urgent: {
        fieldId: 'field-8',
        fieldName: 'urgent',
        fieldType: 'boolean',
        value: false,
        displayValue: '✗',
      },
    },
    cycleTime: {
      resolutionTimeMs: null,
      resolutionTimeFormatted: 'Not started',
      isInProgress: false,
      startedAt: null,
      completedAt: null,
    },
    sla: 'In Progress',
  }),
  createMockMatter({
    id: 'matter-4',
    fields: {
      subject: {
        fieldId: 'field-1',
        fieldName: 'subject',
        fieldType: 'text',
        value: 'Employment Contract Dispute',
        displayValue: 'Employment Contract Dispute',
      },
      'case number': {
        fieldId: 'field-2',
        fieldName: 'case number',
        fieldType: 'number',
        value: 1004,
        displayValue: '1,004',
      },
      status: {
        fieldId: 'field-3',
        fieldName: 'status',
        fieldType: 'status',
        value: mockStatuses.inProgress,
        displayValue: 'In Progress',
      },
      'assigned to': {
        fieldId: 'field-4',
        fieldName: 'assigned to',
        fieldType: 'user',
        value: mockUsers.carol,
        displayValue: 'Carol White',
      },
      priority: {
        fieldId: 'field-5',
        fieldName: 'priority',
        fieldType: 'select',
        value: 'medium',
        displayValue: 'Medium',
      },
      'contract value': {
        fieldId: 'field-6',
        fieldName: 'contract value',
        fieldType: 'currency',
        value: { amount: 75000, currency: 'USD' } as CurrencyValue,
        displayValue: '75,000 USD',
      },
      'due date': {
        fieldId: 'field-7',
        fieldName: 'due date',
        fieldType: 'date',
        value: '2025-12-25T00:00:00.000Z',
        displayValue: '12/25/2025',
      },
      urgent: {
        fieldId: 'field-8',
        fieldName: 'urgent',
        fieldType: 'boolean',
        value: false,
        displayValue: '✗',
      },
    },
    cycleTime: {
      resolutionTimeMs: 14400000, // 4 hours
      resolutionTimeFormatted: '4h 0m',
      isInProgress: true,
      startedAt: '2025-12-15T14:00:00.000Z',
      completedAt: null,
    },
    sla: 'In Progress',
  }),
  createMockMatter({
    id: 'matter-5',
    fields: {
      subject: {
        fieldId: 'field-1',
        fieldName: 'subject',
        fieldType: 'text',
        value: 'Real Estate Transaction',
        displayValue: 'Real Estate Transaction',
      },
      'case number': {
        fieldId: 'field-2',
        fieldName: 'case number',
        fieldType: 'number',
        value: 1005,
        displayValue: '1,005',
      },
      status: {
        fieldId: 'field-3',
        fieldName: 'status',
        fieldType: 'status',
        value: mockStatuses.done,
        displayValue: 'Done',
      },
      'assigned to': {
        fieldId: 'field-4',
        fieldName: 'assigned to',
        fieldType: 'user',
        value: mockUsers.david,
        displayValue: 'David Lee',
      },
      priority: {
        fieldId: 'field-5',
        fieldName: 'priority',
        fieldType: 'select',
        value: 'high',
        displayValue: 'High',
      },
      'contract value': {
        fieldId: 'field-6',
        fieldName: 'contract value',
        fieldType: 'currency',
        value: { amount: 1200000, currency: 'USD' } as CurrencyValue,
        displayValue: '1,200,000 USD',
      },
      'due date': {
        fieldId: 'field-7',
        fieldName: 'due date',
        fieldType: 'date',
        value: '2025-11-30T00:00:00.000Z',
        displayValue: '11/30/2025',
      },
      urgent: {
        fieldId: 'field-8',
        fieldName: 'urgent',
        fieldType: 'boolean',
        value: true,
        displayValue: '✓',
      },
    },
    cycleTime: {
      resolutionTimeMs: 46800000, // 13 hours
      resolutionTimeFormatted: '13h 0m',
      isInProgress: false,
      startedAt: '2025-11-25T08:00:00.000Z',
      completedAt: '2025-11-25T21:00:00.000Z',
    },
    sla: 'Breached',
  }),
];

// Mock API response
export function createMockMatterListResponse(
  page: number = 1,
  limit: number = 25,
  total?: number,
): MatterListResponse {
  const actualTotal = total ?? mockMatters.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMatters = mockMatters.slice(startIndex, endIndex);

  return {
    data: paginatedMatters,
    total: actualTotal,
    page,
    limit,
    totalPages: Math.ceil(actualTotal / limit),
  };
}
