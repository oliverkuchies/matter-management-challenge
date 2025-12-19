import { describe, it, expect } from 'vitest';
import { formatDuration } from './time-utils.js';

describe('formatDuration', () => {
  describe('basic time units', () => {
    it('should format minutes only', () => {
      const result = formatDuration(5 * 60 * 1000, 'Done'); // 5 minutes
      expect(result).toBe('5m');
    });

    it('should format hours and minutes', () => {
      const result = formatDuration(90 * 60 * 1000, 'Done'); // 90 minutes = 1h 30m
      expect(result).toBe('1h 30m');
    });

    it('should format days, hours, and minutes', () => {
      const result = formatDuration(50 * 60 * 60 * 1000, 'Done'); // 50 hours = 2d 2h
      expect(result).toBe('2d 2h');
    });

    it('should format days, hours, and minutes combined', () => {
      const result = formatDuration((2 * 24 * 60 + 3 * 60 + 45) * 60 * 1000, 'Done'); // 2d 3h 45m
      expect(result).toBe('2d 3h 45m');
    });
  });

  describe('edge cases', () => {
    it('should handle zero duration for To Do status', () => {
      const result = formatDuration(0, 'To Do');
      expect(result).toBe('-');
    });

    it('should handle zero duration for In Progress status', () => {
      const result = formatDuration(0, 'In Progress');
      expect(result).toBe('-');
    });

    it('should handle zero duration for Done status', () => {
      const result = formatDuration(0, 'Done');
      expect(result).toBe('');
    });

    it('should handle exactly 1 hour', () => {
      const result = formatDuration(60 * 60 * 1000, 'Done');
      expect(result).toBe('1h');
    });

    it('should handle exactly 1 day', () => {
      const result = formatDuration(24 * 60 * 60 * 1000, 'Done');
      expect(result).toBe('1d');
    });

    it('should omit zero units', () => {
      const result = formatDuration(2 * 24 * 60 * 60 * 1000, 'Done'); // exactly 2 days
      expect(result).toBe('2d');
    });
  });

  describe('in progress flag', () => {
    it('should add "In Progress:" prefix for In Progress status', () => {
      const result = formatDuration(90 * 60 * 1000, 'In Progress');
      expect(result).toBe('In Progress: 1h 30m');
    });

    it('should add "In Progress:" prefix for To Do status', () => {
      const result = formatDuration(90 * 60 * 1000, 'To Do');
      expect(result).toBe('In Progress: 1h 30m');
    });

    it('should not add prefix for Done status', () => {
      const result = formatDuration(90 * 60 * 1000, 'Done');
      expect(result).toBe('1h 30m');
    });

    it('should return dash for zero duration with To Do status', () => {
      const result = formatDuration(0, 'To Do');
      expect(result).toBe('-');
    });

    it('should return dash for zero duration with In Progress status', () => {
      const result = formatDuration(0, 'In Progress');
      expect(result).toBe('-');
    });
  });

  describe('realistic scenarios', () => {
    it('should format 8 hour SLA threshold', () => {
      const result = formatDuration(8 * 60 * 60 * 1000, 'Done');
      expect(result).toBe('8h');
    });

    it('should format matter slightly over SLA', () => {
      const result = formatDuration(8.5 * 60 * 60 * 1000, 'Done');
      expect(result).toBe('8h 30m');
    });

    it('should format multi-day matter', () => {
      const result = formatDuration(3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000, 'Done');
      expect(result).toBe('3d 4h');
    });
  });
});