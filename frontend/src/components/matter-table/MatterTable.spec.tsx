import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatterTable, getStatusBadgeColor } from './MatterTable';
import { Matter } from '../../types/matter';
import { createMockMatter } from '../../../tests/mocks/matterTableMocks';

// Mock the hooks, these add unnecessary complexity to the tests.
// If we wanted to, we could add mock data to the test to verify status updating behavior separately.
// For sake of brevity, we will focus on rendering tests here.
vi.mock('../../hooks/useStatusFieldOptions', () => ({
  useStatusFieldOptions: () => ({ statusFields: [] }),
}));

vi.mock('../../hooks/useUpdateMatterStatus', () => ({
  useUpdateMatterStatus: () => ({ updateStatusAsync: vi.fn(), isUpdating: false }),
}));

describe('MatterTable', () => {
  const mockOnSort = vi.fn();

  describe('SLA Badge Rendering', () => {
    it('should display "In Progress" SLA badge with correct styling', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 2h 30m', 'Working')];

      render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      const slaBadge = screen.getByText('In Progress');
      expect(slaBadge).toBeInTheDocument();
      expect(slaBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should display "Met" SLA badge with correct styling', () => {
      const matters = [createMockMatter('2', 'Met', '2h 30m', 'Done')];

      render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      const slaBadge = screen.getByText('Met');
      expect(slaBadge).toBeInTheDocument();
      expect(slaBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should display "Breached" SLA badge with correct styling', () => {
      const matters = [createMockMatter('3', 'Breached', '10h 15m', 'Done')];

      render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      const slaBadge = screen.getByText('Breached');
      expect(slaBadge).toBeInTheDocument();
      expect(slaBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should render SLA badges with consistent badge styling', () => {
      const matters = [
        createMockMatter('1', 'In Progress', 'In Progress: 2h 30m', 'Working'),
        createMockMatter('2', 'Met', '2h 30m', 'Done'),
        createMockMatter('3', 'Breached', '10h 15m', 'Done'),
      ];

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      // Query SLA badges from the SLA column specifically
      const slaColumn = container.querySelectorAll('tbody tr td:nth-child(10) span');

      expect(slaColumn).toHaveLength(3);
      slaColumn.forEach((badge) => {
        expect(badge).toHaveClass(
          'px-3',
          'py-1',
          'text-xs',
          'font-medium',
          'rounded-full',
          'border',
          'transition-all',
          'duration-200',
        );
      });
    });
  });

  describe('Resolution Time Display', () => {
    it('should display resolution time for in-progress matter with "In Progress:" prefix', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 2h 30m', 'Working')];

      render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      const resolutionTimes = screen.getAllByText('In Progress: 2h 30m');
      expect(resolutionTimes.length).toBeGreaterThan(0);
    });

    it('should display resolution time for completed matter without "In Progress:" prefix', () => {
      const matters = [createMockMatter('2', 'Met', '2h 30m for met', 'Done')];

      render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      expect(screen.getByText('2h 30m for met')).toBeInTheDocument();
    });

    it('should display long resolution times correctly', () => {
      const matters = [createMockMatter('3', 'Breached', '2d 5h 45m', 'Done')];

      render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      expect(screen.getByText('2d 5h 45m')).toBeInTheDocument();
    });

    it('should display short resolution times correctly', () => {
      const matters = [createMockMatter('4', 'Met', '45m', 'Done')];

      render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      expect(screen.getByText('45m')).toBeInTheDocument();
    });
  });

  describe('getStatusBadgeColor', () => {
    it('should return blue styling for "In Progress" SLA', () => {
      const color = getStatusBadgeColor('In Progress');
      expect(color).toBe('bg-blue-100 text-blue-800');
    });

    it('should return green styling for "Met" SLA', () => {
      const color = getStatusBadgeColor('Met');
      expect(color).toBe('bg-green-100 text-green-800');
    });

    it('should return red styling for "Breached" SLA', () => {
      const color = getStatusBadgeColor('Breached');
      expect(color).toBe('bg-red-100 text-red-800');
    });

    it('should return gray styling for unknown SLA status', () => {
      const color = getStatusBadgeColor('Unknown');
      expect(color).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('Multiple Matters with Different SLA Statuses', () => {
    it('should correctly display mixed SLA statuses in the same table', () => {
      const matters = [
        createMockMatter('1', 'In Progress', 'In Progress: 1h 15m', 'Working'),
        createMockMatter('2', 'Met', '3h 45m', 'Done'),
        createMockMatter('3', 'Breached', '12h 30m', 'Done'),
        createMockMatter('4', 'In Progress', 'In Progress: 30m', 'Working'),
        createMockMatter('5', 'Met', '7h 59m', 'Done'),
      ];

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      // Verify all SLA badges are present in SLA column (10th column)
      const slaColumnCells = container.querySelectorAll('tbody tr td:nth-child(10)');
      const slaTexts = Array.from(slaColumnCells).map((cell) => cell.textContent);

      expect(slaTexts.filter((text) => text === 'In Progress')).toHaveLength(2);
      expect(slaTexts.filter((text) => text === 'Met')).toHaveLength(2);
      expect(slaTexts.filter((text) => text === 'Breached')).toHaveLength(1);

      // Verify resolution times in resolution time column (9th column)
      const resolutionTimeCells = container.querySelectorAll('tbody tr td:nth-child(9)');
      const resolutionTexts = Array.from(resolutionTimeCells).map((cell) => cell.textContent);

      expect(resolutionTexts).toContain('In Progress: 1h 15m');
      expect(resolutionTexts).toContain('3h 45m');
      expect(resolutionTexts).toContain('12h 30m');
      expect(resolutionTexts).toContain('In Progress: 30m');
      expect(resolutionTexts).toContain('7h 59m');
    });
  });

  describe('Edge Cases', () => {
    it('should handle matter without cycle time data', () => {
      const matter: Matter = {
        id: '1',
        boardId: 'board-1',
        sla: 'In Progress',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        cycleTime: undefined,
        fields: {
          subject: {
            fieldId: 'subject-field',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'Test Matter',
            displayValue: 'Test Matter',
          },
        },
      };

      render(
        <MatterTable matters={[matter]} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      // Should still show SLA badge - look for all instances and verify at least one exists
      const slaBadges = screen.getAllByText('In Progress');
      expect(slaBadges.length).toBeGreaterThan(0);
    });
  });
});
