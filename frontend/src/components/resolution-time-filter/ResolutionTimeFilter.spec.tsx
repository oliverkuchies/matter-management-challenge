import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ResolutionTimeFilterComponent } from './ResolutionTimeFilter';

describe('ResolutionTimeFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should render the filter with label', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    expect(screen.getByText('Resolution Time:')).toBeInTheDocument();
    expect(screen.getByLabelText('Resolution Time:')).toBeInTheDocument();
  });

  it('should render all filter options', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));

    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent('All');
    expect(options[1]).toHaveTextContent('Under 1 hour');
    expect(options[2]).toHaveTextContent('1-4 hours');
    expect(options[3]).toHaveTextContent('4-8 hours');
    expect(options[4]).toHaveTextContent('Over 8 hours');
  });

  it('should display the currently selected value', () => {
    const { rerender } = render(
      <ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />,
    );
    expect(screen.getByDisplayValue('All')).toBeInTheDocument();

    rerender(<ResolutionTimeFilterComponent value="Under 1 hour" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('Under 1 hour')).toBeInTheDocument();

    rerender(<ResolutionTimeFilterComponent value="1-4 hours" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('1-4 hours')).toBeInTheDocument();

    rerender(<ResolutionTimeFilterComponent value="4-8 hours" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('4-8 hours')).toBeInTheDocument();

    rerender(<ResolutionTimeFilterComponent value="Over 8 hours" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('Over 8 hours')).toBeInTheDocument();
  });

  it('should call onChange with "All" when selecting All option', () => {
    render(<ResolutionTimeFilterComponent value="Under 1 hour" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'All' } });

    expect(mockOnChange).toHaveBeenCalledWith('All');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should call onChange with "Under 1 hour" when selecting Under 1 hour option', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Under 1 hour' } });

    expect(mockOnChange).toHaveBeenCalledWith('Under 1 hour');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should call onChange with "1-4 hours" when selecting 1-4 hours option', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1-4 hours' } });

    expect(mockOnChange).toHaveBeenCalledWith('1-4 hours');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should call onChange with "4-8 hours" when selecting 4-8 hours option', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '4-8 hours' } });

    expect(mockOnChange).toHaveBeenCalledWith('4-8 hours');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should call onChange with "Over 8 hours" when selecting Over 8 hours option', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Over 8 hours' } });

    expect(mockOnChange).toHaveBeenCalledWith('Over 8 hours');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'resolution-time-filter');

    const label = screen.getByText('Resolution Time:');
    expect(label).toHaveAttribute('for', 'resolution-time-filter');
  });

  it('should apply correct CSS classes', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    const container = screen.getByText('Resolution Time:').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'gap-2');

    const label = screen.getByText('Resolution Time:');
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

  it('should render each option with correct key and value attributes', () => {
    render(<ResolutionTimeFilterComponent value="All" onChange={mockOnChange} />);

    const options = screen.getAllByRole('option') as HTMLOptionElement[];

    options.forEach((option) => {
      expect(option).toHaveAttribute('value', option.textContent);
    });
  });
});
