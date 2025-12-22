import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DueDateFilterComponent } from './DueDateFilter';

describe('DueDateFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should render the filter with label', () => {
    render(<DueDateFilterComponent value="All" onChange={mockOnChange} />);

    expect(screen.getByText('Due Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date:')).toBeInTheDocument();
  });

  it('should render all filter options', () => {
    render(<DueDateFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));

    expect(options).toHaveLength(6);
    expect(options[0]).toHaveTextContent('All');
    expect(options[1]).toHaveTextContent('Overdue');
    expect(options[2]).toHaveTextContent('Due Today');
    expect(options[3]).toHaveTextContent('Due This Week');
    expect(options[4]).toHaveTextContent('Due This Month');
    expect(options[5]).toHaveTextContent('No Due Date');
  });

  it('should display the currently selected value', () => {
    const { rerender } = render(<DueDateFilterComponent value="All" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('All')).toBeInTheDocument();

    rerender(<DueDateFilterComponent value="Overdue" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('Overdue')).toBeInTheDocument();

    rerender(<DueDateFilterComponent value="Due Today" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('Due Today')).toBeInTheDocument();

    rerender(<DueDateFilterComponent value="Due This Week" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('Due This Week')).toBeInTheDocument();

    rerender(<DueDateFilterComponent value="Due This Month" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('Due This Month')).toBeInTheDocument();

    rerender(<DueDateFilterComponent value="No Due Date" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('No Due Date')).toBeInTheDocument();
  });

  it('should call onChange when selecting different options', () => {
    render(<DueDateFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'Overdue' } });
    expect(mockOnChange).toHaveBeenCalledWith('Overdue');

    fireEvent.change(select, { target: { value: 'Due Today' } });
    expect(mockOnChange).toHaveBeenCalledWith('Due Today');

    fireEvent.change(select, { target: { value: 'Due This Week' } });
    expect(mockOnChange).toHaveBeenCalledWith('Due This Week');
  });

  it('should have proper accessibility attributes', () => {
    render(<DueDateFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'due-date-filter');

    const label = screen.getByText('Due Date:');
    expect(label).toHaveAttribute('for', 'due-date-filter');
  });

  it('should apply correct CSS classes', () => {
    render(<DueDateFilterComponent value="All" onChange={mockOnChange} />);

    const container = screen.getByText('Due Date:').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'gap-2');

    const label = screen.getByText('Due Date:');
    expect(label).toHaveClass('text-sm', 'font-medium', 'text-gray-700', 'whitespace-nowrap');

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass(
      'block',
      'rounded-md',
      'border-gray-300',
      'shadow-sm',
      'focus:border-blue-500',
      'focus:ring-blue-500',
      'text-sm',
      'py-2',
      'px-3',
    );
  });
});
