import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SlaFilter } from './SlaFilter';

describe('SlaFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should render the filter with label', () => {
    render(<SlaFilter value="All" onChange={mockOnChange} />);

    expect(screen.getByText('SLA Status:')).toBeInTheDocument();
    expect(screen.getByLabelText('SLA Status:')).toBeInTheDocument();
  });

  it('should render all filter options', () => {
    render(<SlaFilter value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('All');
    expect(options[1]).toHaveTextContent('In Progress');
    expect(options[2]).toHaveTextContent('Met');
    expect(options[3]).toHaveTextContent('Breached');
  });

  it('should display the currently selected value', () => {
    const { rerender } = render(<SlaFilter value="All" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('All')).toBeInTheDocument();

    rerender(<SlaFilter value="In Progress" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument();

    rerender(<SlaFilter value="Met" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('Met')).toBeInTheDocument();

    rerender(<SlaFilter value="Breached" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('Breached')).toBeInTheDocument();
  });

  it('should call onChange with "All" when selecting All option', () => {
    render(<SlaFilter value="In Progress" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'All' } });

    expect(mockOnChange).toHaveBeenCalledWith('All');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should call onChange with "In Progress" when selecting In Progress option', () => {
    render(<SlaFilter value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'In Progress' } });

    expect(mockOnChange).toHaveBeenCalledWith('In Progress');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should call onChange with "Met" when selecting Met option', () => {
    render(<SlaFilter value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Met' } });

    expect(mockOnChange).toHaveBeenCalledWith('Met');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should call onChange with "Breached" when selecting Breached option', () => {
    render(<SlaFilter value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Breached' } });

    expect(mockOnChange).toHaveBeenCalledWith('Breached');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<SlaFilter value="All" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'sla-filter');

    const label = screen.getByText('SLA Status:');
    expect(label).toHaveAttribute('for', 'sla-filter');
  });

  it('should apply correct CSS classes', () => {
    render(<SlaFilter value="All" onChange={mockOnChange} />);

    const container = screen.getByText('SLA Status:').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'gap-2');

    const label = screen.getByText('SLA Status:');
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
    render(<SlaFilter value="All" onChange={mockOnChange} />);

    const options = screen.getAllByRole('option') as HTMLOptionElement[];

    options.forEach((option) => {
      expect(option).toHaveAttribute('value', option.textContent);
    });
  });
});
