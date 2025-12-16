# Storybook & Mock Data Setup

This directory contains Storybook stories and MSW (Mock Service Worker) configuration for testing UI components in isolation.

## 📚 What's Included

### Storybook Stories

- **MatterTable.stories.tsx** - Stories for the MatterTable component with various states
- **Pagination.stories.tsx** - Stories for the Pagination component

### Mock Data

- **mockData.ts** - Reusable mock data generators and sample matters
- **handlers.ts** - MSW request handlers for API mocking

## 🚀 Running Storybook

```bash
# Start Storybook development server
npm run storybook

# Build Storybook for production
npm run build-storybook
```

Storybook will be available at http://localhost:6006

## 🎭 Available Stories

### MatterTable Stories

1. **Default** - Shows the table with all 5 mock matters
2. **Empty** - Empty state when no matters exist
3. **SingleMatter** - Table with only one matter
4. **SortedBySubject** - Pre-sorted data by subject
5. **AllSLAStatuses** - Examples of all SLA statuses (In Progress, Met, Breached)
6. **HighPriorityUrgent** - Filtered high priority urgent matters
7. **LargeContracts** - Matters with contract value >= $500k
8. **Interactive** - Interactive example with alerts on sort

### Pagination Stories

1. **FirstPage** - First page state
2. **MiddlePage** - Middle page navigation
3. **LastPage** - Last page state
4. **SinglePage** - No pagination needed (< 1 page of results)
5. **ManyPages** - Large dataset (100 pages)
6. **SmallItemsPerPage** - 10 items per page
7. **LargeItemsPerPage** - 100 items per page
8. **Interactive** - Interactive example with alerts

## 🧪 Using Mock Data

### Creating Custom Mock Matters

```typescript
import { createMockMatter } from '../mocks/mockData';

// Create a basic mock matter
const matter = createMockMatter();

// Create a matter with custom fields
const customMatter = createMockMatter({
  id: 'custom-1',
  sla: 'Breached',
  fields: {
    'subject': {
      fieldId: 'field-1',
      fieldName: 'subject',
      fieldType: 'text',
      value: 'Custom Subject',
      displayValue: 'Custom Subject',
    },
    // ... other fields
  },
});
```

### Using Pre-defined Mock Matters

```typescript
import { mockMatters } from '../mocks/mockData';

// Use all 5 pre-defined matters
const matters = mockMatters;

// Filter matters
const urgentMatters = mockMatters.filter(
  m => m.fields['Urgent']?.value === true
);
```

### Mock API Response

```typescript
import { createMockMatterListResponse } from '../mocks/mockData';

// Create paginated response
const response = createMockMatterListResponse(1, 25); // page 1, 25 items
```

## 🔌 MSW Integration

MSW is integrated with Storybook to mock API calls. The handlers are defined in `handlers.ts` and automatically applied to all stories.

### Available API Endpoints

- `GET /api/v1/matters` - List matters with pagination
- `GET /api/v1/matters/:id` - Get single matter
- `PATCH /api/v1/matters/:id` - Update matter

### Adding Custom MSW Handlers

You can override or add MSW handlers per story:

```typescript
import { http, HttpResponse } from 'msw';

export const CustomAPIResponse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/matters', () => {
          return HttpResponse.json({
            data: [],
            total: 0,
            page: 1,
            limit: 25,
            totalPages: 0,
          });
        }),
      ],
    },
  },
  args: {
    // ... story args
  },
};
```

## 🎨 Mock Data Structure

### Mock Users

- Alice Brown (id: 1)
- Jane Smith (id: 2)
- Bob Johnson (id: 3)
- Carol White (id: 4)
- David Lee (id: 5)

### Mock Statuses

- Backlog (To Do)
- Active (In Progress)
- Review (In Progress)
- Completed (Done)
- Closed (Done)

### Mock Matters Overview

1. **Patent Application Review**
   - Status: Completed
   - SLA: Met (6h)
   - Priority: High
   - Urgent: Yes

2. **Corporate Merger Agreement**
   - Status: Active
   - SLA: Breached (10h)
   - Priority: High
   - Urgent: Yes

3. **Trademark Registration**
   - Status: Backlog
   - SLA: In Progress (Not started)
   - Priority: Low
   - Urgent: No

4. **Employment Contract Dispute**
   - Status: Review
   - SLA: In Progress (4h)
   - Priority: Medium
   - Urgent: No

5. **Real Estate Transaction**
   - Status: Closed
   - SLA: Breached (13h)
   - Priority: High
   - Urgent: Yes

## 🧩 Testing Components

Storybook is great for:

- **Visual Testing** - See how components look with different data
- **Interaction Testing** - Test click handlers and user interactions
- **Edge Cases** - Test empty states, loading states, error states
- **Accessibility** - Use the a11y addon to check accessibility
- **Responsive Design** - Test different viewport sizes

## 📖 Documentation

Each story is automatically documented with:

- Component props and controls
- Source code
- Interactive playground

Use the "Docs" tab in Storybook to view the auto-generated documentation.

## 🛠️ Development Tips

1. **Use Controls** - Modify props in real-time using Storybook controls
2. **Actions** - View event handlers in the Actions panel
3. **Viewport** - Test responsive design with the viewport toolbar
4. **Accessibility** - Check the a11y panel for accessibility issues
5. **Story Source** - View the story source code in the Docs tab

## 🔄 Integration with Tests

You can reuse the mock data in your tests:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatterTable } from '../components/MatterTable';
import { mockMatters } from '../mocks/mockData';

describe('MatterTable', () => {
  it('renders matters', () => {
    render(
      <MatterTable
        matters={mockMatters}
        sortBy="created_at"
        sortOrder="desc"
        onSort={() => {}}
      />
    );
    
    expect(screen.getByText('Patent Application Review')).toBeInTheDocument();
  });
});
```

## 📚 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)
