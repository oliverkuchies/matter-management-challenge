# Mock Data & MSW Setup

This directory contains mock data and MSW (Mock Service Worker) handlers for testing and development.

## Files

- **mockData.ts** - Mock data generators and sample matters
  - `mockUsers` - 5 pre-defined user objects
  - `mockStatuses` - Status values for all status types
  - `mockMatters` - Array of 5 sample matters with different scenarios
  - `createMockMatter()` - Helper to create custom mock matters
  - `createMockMatterListResponse()` - Helper to create paginated API responses

- **handlers.ts** - MSW request handlers for API endpoints
  - `GET /api/v1/matters` - List matters with pagination
  - `GET /api/v1/matters/:id` - Get single matter
  - `PATCH /api/v1/matters/:id` - Update matter

- **browser.ts** - MSW worker setup for browser (development use)

## Using Mock Data in Storybook

Mock data is automatically available in all Storybook stories through MSW integration.

```typescript
import { mockMatters } from '../mocks/mockData';

export const MyStory: Story = {
  args: {
    matters: mockMatters,
  },
};
```

## Using MSW in Development (Optional)

If you want to use MSW in your development environment to avoid calling the real API:

1. Update `src/main.tsx`:

```typescript
// Enable MSW in development
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  worker.start();
}
```

2. Start the dev server:

```bash
npm run dev
```

The app will now use mock data instead of calling the real API.

## Creating Custom Mock Data

### Create a single matter

```typescript
import { createMockMatter } from './mocks/mockData';

const matter = createMockMatter({
  sla: 'Breached',
  cycleTime: {
    resolutionTimeMs: 50000000,
    resolutionTimeFormatted: '13h 53m',
    isInProgress: false,
    startedAt: '2025-12-15T08:00:00.000Z',
    completedAt: '2025-12-15T21:53:00.000Z',
  },
});
```

### Override specific fields

```typescript
import { createMockMatter, mockUsers, mockStatuses } from './mocks/mockData';

const customMatter = createMockMatter({
  id: 'custom-123',
  fields: {
    'subject': {
      fieldId: 'field-1',
      fieldName: 'subject',
      fieldType: 'text',
      value: 'My Custom Matter',
      displayValue: 'My Custom Matter',
    },
    'Assigned To': {
      fieldId: 'field-4',
      fieldName: 'Assigned To',
      fieldType: 'user',
      value: mockUsers.bob,
      displayValue: 'Bob Johnson',
    },
    'Status': {
      fieldId: 'field-3',
      fieldName: 'Status',
      fieldType: 'status',
      value: mockStatuses.completed,
      displayValue: 'Completed',
    },
  },
});
```

## Mock Data Scenarios

The `mockMatters` array includes 5 different scenarios:

1. **Completed with SLA Met** - Patent application (6h, High priority, Urgent)
2. **Active with SLA Breached** - Corporate merger (10h, High priority, Urgent)
3. **Backlog (Not Started)** - Trademark registration (Low priority)
4. **In Review (In Progress)** - Employment dispute (4h, Medium priority)
5. **Closed with SLA Breached** - Real estate (13h, High priority, Urgent)

These cover various edge cases for testing UI components.
