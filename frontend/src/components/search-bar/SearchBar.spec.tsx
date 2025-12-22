import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default placeholder', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText('Search matters...')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} placeholder="Search for legal matters..." />);

      expect(screen.getByPlaceholderText('Search for legal matters...')).toBeInTheDocument();
    });

    it('should display search icon when not searching', () => {
      const mockOnChange = vi.fn();
      const { container } = render(<SearchBar onChange={mockOnChange} />);

      const searchIcon = container.querySelector('svg path[stroke-linecap="round"]');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should start with empty value when uncontrolled', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('User Interaction', () => {
    it('should update input value when typing', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'new search' } });

      expect((input as HTMLInputElement).value).toBe('new search');
    });

    it('should debounce onChange calls', async () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} debounceMs={500} />);

      const input = screen.getByPlaceholderText('Search matters...');

      // Type multiple characters quickly
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });

      // Should not call onChange immediately
      expect(mockOnChange).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(500);

      // Should call onChange once with final value
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('abc');
    });

    it('should respect custom debounce duration', async () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} debounceMs={1000} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'test' } });

      // After 500ms, should not have called yet
      vi.advanceTimersByTime(500);
      expect(mockOnChange).not.toHaveBeenCalled();

      // After 1000ms, should have called
      vi.advanceTimersByTime(500);
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });

    it('should show searching state during debounce', () => {
      const mockOnChange = vi.fn();
      const { container } = render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'search' } });

      // Should show spinner
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should hide searching state after debounce completes', async () => {
      const mockOnChange = vi.fn();
      const { container, rerender } = render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'search' } });

      // Advance past debounce
      vi.advanceTimersByTime(500);

      // Force rerender to reflect state change
      rerender(<SearchBar onChange={mockOnChange} />);

      // Should not show spinner
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Clear Button', () => {
    it('should show clear button when input has value', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear button when input is empty', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should clear input and call onChange when clear button clicked', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);

      expect(input.value).toBe('');
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should not show clear button when disabled', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} disabled={true} />);

      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('Search State Display', () => {
    it('should show search state when input has value', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'my search' } });

      expect(screen.getByText(/Searching for:/)).toBeInTheDocument();
      expect(screen.getByText('my search')).toBeInTheDocument();
    });

    it('should not show search state when input is empty', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      expect(screen.queryByText(/Searching for:/)).not.toBeInTheDocument();
    });

    it('should show updating indicator during debounce', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(screen.getByText(/\(updating\.\.\.\)/)).toBeInTheDocument();
    });

    it('should hide updating indicator after debounce', async () => {
      const mockOnChange = vi.fn();
      const { rerender } = render(<SearchBar onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'test' } });

      vi.advanceTimersByTime(500);

      // Force rerender to reflect state change
      rerender(<SearchBar onChange={mockOnChange} />);

      expect(screen.queryByText(/\(updating\.\.\.\)/)).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} disabled={true} />);

      const input = screen.getByPlaceholderText('Search matters...') as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('should apply disabled styles when disabled', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} disabled={true} />);

      const input = screen.getByPlaceholderText('Search matters...') as HTMLInputElement;
      expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    });

    it('should not trigger onChange when typing while disabled', () => {
      const mockOnChange = vi.fn();
      render(<SearchBar onChange={mockOnChange} disabled={true} />);

      const input = screen.getByPlaceholderText('Search matters...');
      fireEvent.change(input, { target: { value: 'test' } });

      vi.advanceTimersByTime(500);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
