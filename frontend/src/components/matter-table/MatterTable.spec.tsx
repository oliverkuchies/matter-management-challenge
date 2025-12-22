import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
        expect(badge).toHaveClass('px-2', 'py-1', 'rounded-full', 'text-xs');
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

  describe('Column Sorting', () => {
    it('should call onSort when clicking subject column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const subjectHeader = container.querySelector('th:nth-child(1)') as HTMLElement;
      fireEvent.click(subjectHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('subject');
    });

    it('should call onSort when clicking case number column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const caseNumberHeader = container.querySelector('th:nth-child(2)') as HTMLElement;
      fireEvent.click(caseNumberHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('case number');
    });

    it('should call onSort when clicking status column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const statusHeader = container.querySelector('th:nth-child(3)') as HTMLElement;
      fireEvent.click(statusHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('status');
    });

    it('should call onSort when clicking assigned to column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const assignedToHeader = container.querySelector('th:nth-child(4)') as HTMLElement;
      fireEvent.click(assignedToHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('assigned to');
    });

    it('should call onSort when clicking priority column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const priorityHeader = container.querySelector('th:nth-child(5)') as HTMLElement;
      fireEvent.click(priorityHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('priority');
    });

    it('should call onSort when clicking contract value column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const contractValueHeader = container.querySelector('th:nth-child(6)') as HTMLElement;
      fireEvent.click(contractValueHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('contract value');
    });

    it('should call onSort when clicking due date column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const dueDateHeader = container.querySelector('th:nth-child(7)') as HTMLElement;
      fireEvent.click(dueDateHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('due date');
    });

    it('should call onSort when clicking urgent column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const urgentHeader = container.querySelector('th:nth-child(8)') as HTMLElement;
      fireEvent.click(urgentHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('urgent');
    });

    it('should call onSort when clicking resolution time column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const resolutionTimeHeader = container.querySelector('th:nth-child(9)') as HTMLElement;
      fireEvent.click(resolutionTimeHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('resolution_time');
    });

    it('should call onSort when clicking SLA column header', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];
      const mockOnSortFn = vi.fn();

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSortFn} />,
      );

      const slaHeader = container.querySelector('th:nth-child(10)') as HTMLElement;
      fireEvent.click(slaHeader);

      expect(mockOnSortFn).toHaveBeenCalledWith('sla');
    });

    it('should display ascending sort icon when column is sorted ascending', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      // Check that the ascending arrow is shown for the subject column
      const subjectHeader = container.querySelector('th');
      const svgPath = subjectHeader?.querySelector('svg path');
      expect(svgPath).toHaveAttribute('d', 'M5 15l7-7 7 7');
    });

    it('should display descending sort icon when column is sorted descending', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="desc" onSort={mockOnSort} />,
      );

      // Check that the descending arrow is shown for the subject column
      const subjectHeader = container.querySelector('th');
      const svgPath = subjectHeader?.querySelector('svg path');
      expect(svgPath).toHaveAttribute('d', 'M19 9l-7 7-7-7');
    });

    it('should display neutral sort icon for columns that are not currently sorted', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      // Check that other columns show the neutral sort icon
      const headers = container.querySelectorAll('th');
      const caseNumberHeader = headers[1]; // Second column
      const svgPath = caseNumberHeader?.querySelector('svg path');
      expect(svgPath).toHaveAttribute('d', 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4');
    });

    it('should update sort icon when sortBy prop changes', () => {
      const matters = [createMockMatter('1', 'In Progress', 'In Progress: 1h', 'Working')];

      const { container, rerender } = render(
        <MatterTable matters={matters} sortBy="subject" sortOrder="asc" onSort={mockOnSort} />,
      );

      // Initially sorted by subject
      let subjectHeader = container.querySelector('th');
      let svgPath = subjectHeader?.querySelector('svg path');
      expect(svgPath).toHaveAttribute('d', 'M5 15l7-7 7 7');

      // Change to sort by case number
      rerender(
        <MatterTable matters={matters} sortBy="case number" sortOrder="desc" onSort={mockOnSort} />,
      );

      // Subject should now show neutral icon
      subjectHeader = container.querySelector('th');
      svgPath = subjectHeader?.querySelector('svg path');
      expect(svgPath).toHaveAttribute('d', 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4');

      // Case number should show descending icon
      const headers = container.querySelectorAll('th');
      const caseNumberHeader = headers[1];
      const caseNumberSvgPath = caseNumberHeader?.querySelector('svg path');
      expect(caseNumberSvgPath).toHaveAttribute('d', 'M19 9l-7 7-7-7');
    });
  });

  describe('Data Sorting Verification', () => {
    it('should sort by subject when clicking subject header', () => {
      const matters = [
        createMockMatter('1', 'Met', '1h', 'Done'),
        createMockMatter('2', 'In Progress', '2h', 'Working'),
        createMockMatter('3', 'Breached', '3h', 'Done'),
      ];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const subjectHeader = container.querySelector('th:nth-child(1)') as HTMLElement;
      fireEvent.click(subjectHeader);

      expect(mockOnSort).toHaveBeenCalledWith('subject');
    });

    it('should sort by case number when clicking case number header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const caseNumberHeader = container.querySelector('th:nth-child(2)') as HTMLElement;
      fireEvent.click(caseNumberHeader);

      expect(mockOnSort).toHaveBeenCalledWith('case number');
    });

    it('should sort by status when clicking status header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const statusHeader = container.querySelector('th:nth-child(3)') as HTMLElement;
      fireEvent.click(statusHeader);

      expect(mockOnSort).toHaveBeenCalledWith('status');
    });

    it('should sort by assigned to when clicking assigned to header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const assignedToHeader = container.querySelector('th:nth-child(4)') as HTMLElement;
      fireEvent.click(assignedToHeader);

      expect(mockOnSort).toHaveBeenCalledWith('assigned to');
    });

    it('should sort by priority when clicking priority header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const priorityHeader = container.querySelector('th:nth-child(5)') as HTMLElement;
      fireEvent.click(priorityHeader);

      expect(mockOnSort).toHaveBeenCalledWith('priority');
    });

    it('should sort by contract value when clicking contract value header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const contractValueHeader = container.querySelector('th:nth-child(6)') as HTMLElement;
      fireEvent.click(contractValueHeader);

      expect(mockOnSort).toHaveBeenCalledWith('contract value');
    });

    it('should sort by due date when clicking due date header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const dueDateHeader = container.querySelector('th:nth-child(7)') as HTMLElement;
      fireEvent.click(dueDateHeader);

      expect(mockOnSort).toHaveBeenCalledWith('due date');
    });

    it('should sort by urgent when clicking urgent header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const urgentHeader = container.querySelector('th:nth-child(8)') as HTMLElement;
      fireEvent.click(urgentHeader);

      expect(mockOnSort).toHaveBeenCalledWith('urgent');
    });

    it('should sort by resolution time when clicking resolution time header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const resolutionTimeHeader = container.querySelector('th:nth-child(9)') as HTMLElement;
      fireEvent.click(resolutionTimeHeader);

      expect(mockOnSort).toHaveBeenCalledWith('resolution_time');
    });

    it('should sort by SLA when clicking SLA header', () => {
      const matters = [createMockMatter('1', 'Met', '1h', 'Done')];

      const { container } = render(
        <MatterTable matters={matters} sortBy="" sortOrder="asc" onSort={mockOnSort} />,
      );

      const slaHeader = container.querySelector('th:nth-child(10)') as HTMLElement;
      fireEvent.click(slaHeader);

      expect(mockOnSort).toHaveBeenCalledWith('sla');
    });
  });
});
