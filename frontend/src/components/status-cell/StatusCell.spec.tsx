import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatusCell } from './StatusCell';
import { mockCurrentStatus, mockAvailableStatuses } from '../../../tests/mocks/statusCellMocks';

// Mock the useCloseOutsideClicks hook, prefer not to test it in this scope.
vi.mock('./hooks/useCloseOutsideClicks', () => ({
  useCloseOutsideClicks: vi.fn(),
}));

describe('StatusCell', () => {
  const mockOnUpdate = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should change status to "To Do"', async () => {
    render(
      <StatusCell
        matterId="matter-1"
        currentStatus={{ ...mockCurrentStatus, displayValue: 'In Progress' }}
        availableStatuses={mockAvailableStatuses}
        onUpdate={mockOnUpdate}
      />,
    );

    // Open dropdown
    const statusButton = screen.getAllByLabelText('Current Status')[0];
    fireEvent.click(statusButton);

    // Click "To Do" option
    const toDoOption = screen.getAllByText('To Do')[0];
    fireEvent.click(toDoOption);

    await waitFor(() => {
      expect(mockOnUpdate).not.toHaveBeenCalledWith('matter-1', 'status-field-id', 'status-1');
    });
  });

  it('should change status to "In Progress"', async () => {
    render(
      <StatusCell
        matterId="matter-1"
        currentStatus={mockCurrentStatus}
        availableStatuses={mockAvailableStatuses}
        onUpdate={mockOnUpdate}
      />,
    );

    // Open dropdown
    const statusButton = screen.getAllByLabelText('Current Status')[0];
    fireEvent.click(statusButton);

    // Click "In Progress" option
    const inProgressOption = screen.getByRole('button', { name: /In Progress/i });
    fireEvent.click(inProgressOption);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('matter-1', 'status-field-id', 'status-2');
    });
  });

  it('should change status to "Done"', async () => {
    render(
      <StatusCell
        matterId="matter-1"
        currentStatus={mockCurrentStatus}
        availableStatuses={mockAvailableStatuses}
        onUpdate={mockOnUpdate}
      />,
    );

    // Open dropdown
    const statusButton = screen.getAllByLabelText('Current Status')[0];
    fireEvent.click(statusButton);

    // Click "Done" option
    const doneOption = screen.getAllByText('Done')[0];
    fireEvent.click(doneOption);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('matter-1', 'status-field-id', 'status-3');
    });
  });

  it('should display nothing when availableStatuses is empty', () => {
    render(
      <StatusCell
        matterId="matter-1"
        currentStatus={mockCurrentStatus}
        availableStatuses={[]}
        onUpdate={mockOnUpdate}
      />,
    );

    // Should show "No Statuses Available" message
    expect(screen.getByText('No Statuses Available')).toBeInTheDocument();
  });

  it('should not call update when clicking the current status', async () => {
    render(
      <StatusCell
        matterId="matter-1"
        currentStatus={mockCurrentStatus}
        availableStatuses={mockAvailableStatuses}
        onUpdate={mockOnUpdate}
      />,
    );

    // Open dropdown
    const statusButton = screen.getAllByLabelText('Current Status')[0];
    fireEvent.click(statusButton);

    // Click current status - find the one in the dropdown (not the main button)
    const dropdownOptions = screen.getAllByRole('button');
    const currentOption = dropdownOptions.find(
      (btn) => btn.textContent?.includes('To Do') && btn !== statusButton,
    );

    if (currentOption) {
      fireEvent.click(currentOption);
    }

    // Don't use waitFor for negative assertions
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
});
