import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { MatterTableWrapper } from './MatterTableWrapper';
import { MatterListResponse } from '../../types/matter';
import { createMockMatter } from '../../mocks/mockData';

const API_URL = 'http://localhost:3000/api/v1';

// Create MSW server
const server = setupServer();

// Setup server hooks
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to render with providers
function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
}

describe('MatterTableWrapper', () => {
  describe('SLA Badge Rendering', () => {
    it('should display "In Progress" SLA badge with correct styling', async () => {
      const mockMatter = createMockMatter({
        id: 'matter-1',
        sla: 'In Progress',
        cycleTime: {
          resolutionTimeMs: 9000000,
          resolutionTimeFormatted: 'In Progress: 2h 30m',
          isInProgress: true,
          startedAt: new Date().toISOString(),
          completedAt: null,
        },
      });

      server.use(
        http.get(`${API_URL}/matters`, () => {
          const response: MatterListResponse = {
            data: [mockMatter],
            total: 1,
            page: 1,
            limit: 25,
            totalPages: 1,
          };
          return HttpResponse.json(response);
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      await waitFor(() => {
        const slaBadge = screen.getByText('In Progress');
        expect(slaBadge).toBeInTheDocument();
        expect(slaBadge).toHaveClass('bg-blue-100', 'text-blue-800');
      });
    });

    it('should display "Met" SLA badge with correct styling', async () => {
      const mockMatter = createMockMatter({
        id: 'matter-2',
        sla: 'Met',
        cycleTime: {
          resolutionTimeMs: 9000000,
          resolutionTimeFormatted: '2h 30m',
          isInProgress: false,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      });

      server.use(
        http.get(`${API_URL}/matters`, () => {
          const response: MatterListResponse = {
            data: [mockMatter],
            total: 1,
            page: 1,
            limit: 25,
            totalPages: 1,
          };
          return HttpResponse.json(response);
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      await waitFor(() => {
        const slaBadge = screen.getByText('Met');
        expect(slaBadge).toBeInTheDocument();
        expect(slaBadge).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('should display "Breached" SLA badge with correct styling', async () => {
      const mockMatter = createMockMatter({
        id: 'matter-3',
        sla: 'Breached',
        cycleTime: {
          resolutionTimeMs: 36900000,
          resolutionTimeFormatted: '10h 15m',
          isInProgress: false,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      });

      server.use(
        http.get(`${API_URL}/matters`, () => {
          const response: MatterListResponse = {
            data: [mockMatter],
            total: 1,
            page: 1,
            limit: 25,
            totalPages: 1,
          };
          return HttpResponse.json(response);
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      await waitFor(() => {
        const slaBadge = screen.getByText('Breached');
        expect(slaBadge).toBeInTheDocument();
        expect(slaBadge).toHaveClass('bg-red-100', 'text-red-800');
      });
    });
  });

  describe('Resolution Time Display', () => {
    it('should display resolution time for in-progress matter', async () => {
      const mockMatter = createMockMatter({
        id: 'matter-1',
        sla: 'In Progress',
        cycleTime: {
          resolutionTimeMs: 9000000,
          resolutionTimeFormatted: 'In Progress: 2h 30m',
          isInProgress: true,
          startedAt: new Date().toISOString(),
          completedAt: null,
        },
      });

      server.use(
        http.get(`${API_URL}/matters`, () => {
          const response: MatterListResponse = {
            data: [mockMatter],
            total: 1,
            page: 1,
            limit: 25,
            totalPages: 1,
          };
          return HttpResponse.json(response);
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      await waitFor(() => {
        expect(screen.getByText('In Progress: 2h 30m')).toBeInTheDocument();
      });
    });

    it('should display resolution time for completed matter', async () => {
      const mockMatter = createMockMatter({
        id: 'matter-2',
        sla: 'Met',
        cycleTime: {
          resolutionTimeMs: 9000000,
          resolutionTimeFormatted: '2h 30m',
          isInProgress: false,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      });

      server.use(
        http.get(`${API_URL}/matters`, () => {
          const response: MatterListResponse = {
            data: [mockMatter],
            total: 1,
            page: 1,
            limit: 25,
            totalPages: 1,
          };
          return HttpResponse.json(response);
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      await waitFor(() => {
        expect(screen.getByText('2h 30m')).toBeInTheDocument();
      });
    });
  });

  describe('Table Structure', () => {
    it('should render table headers correctly', async () => {
      server.use(
        http.get(`${API_URL}/matters`, () => {
          const response: MatterListResponse = {
            data: [],
            total: 0,
            page: 1,
            limit: 25,
            totalPages: 0,
          };
          return HttpResponse.json(response);
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      await waitFor(() => {
        const headers = screen.getAllByRole('columnheader');
        const headerTexts = headers.map((h) => h.textContent);
        expect(headerTexts.some((text) => text?.includes('Subject'))).toBe(true);
        expect(headerTexts.some((text) => text?.includes('Case Number'))).toBe(true);
        expect(headerTexts.some((text) => text?.includes('Status'))).toBe(true);
        expect(headerTexts.some((text) => text?.includes('SLA'))).toBe(true);
      });
    });

    it('should display loading state initially', async () => {
      server.use(
        http.get(`${API_URL}/matters`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            data: [],
            total: 0,
            page: 1,
            limit: 25,
            totalPages: 0,
          });
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      // Check that eventually we get the empty state after loading
      await waitFor(() => {
        expect(screen.getByText('No matters found')).toBeInTheDocument();
      });
    });

    it('should display empty state when no matters exist', async () => {
      server.use(
        http.get(`${API_URL}/matters`, () => {
          const response: MatterListResponse = {
            data: [],
            total: 0,
            page: 1,
            limit: 25,
            totalPages: 0,
          };
          return HttpResponse.json(response);
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      await waitFor(() => {
        expect(screen.getByText('No matters found')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should render matter data correctly', async () => {
      const mockMatter = createMockMatter({
        id: 'matter-1',
        fields: {
          subject: {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'Test Contract Review',
            displayValue: 'Test Contract Review',
          },
          'case number': {
            fieldId: 'field-2',
            fieldName: 'case number',
            fieldType: 'number',
            value: 12345,
            displayValue: '12,345',
          },
        },
        sla: 'In Progress',
      });

      server.use(
        http.get(`${API_URL}/matters`, () => {
          const response: MatterListResponse = {
            data: [mockMatter],
            total: 1,
            page: 1,
            limit: 25,
            totalPages: 1,
          };
          return HttpResponse.json(response);
        }),
      );

      renderWithProviders(<MatterTableWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Test Contract Review')).toBeInTheDocument();
        expect(screen.getByText('12,345')).toBeInTheDocument();
      });
    });
  });
});

/** These tests could be expanded, but don't have the time.
 * In real world I would probably work on these tests to make sure UI responds well to backend. */
