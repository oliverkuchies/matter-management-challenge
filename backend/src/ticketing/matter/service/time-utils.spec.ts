import { describe, it, expect } from 'vitest';
import { calculateDifference, formatDuration } from './time-utils.js';

/**
 * When building utilities, such as time transformation -> I usually decouple them from classes
 * Where possible, I will place in a reusable package for other applications (and publish it internally),
 * Or alternatively, just do what I did with time-utils.
 */

describe('calculateDifference', () => {
  describe('basic calculations', () => {
    it('should calculate difference between two dates', () => {
      const start = '2023-01-19T03:04:10.264Z';
      const end = '2023-01-19T13:47:43.901Z';
      const result = calculateDifference(start, end);
      
      const expectedDiff = new Date(end).getTime() - new Date(start).getTime();
      expect(result).toBe(expectedDiff);
    });

    it('should return positive value when end is after start', () => {
      const start = '2023-01-19T10:00:00.000Z';
      const end = '2023-01-19T12:00:00.000Z';
      const result = calculateDifference(start, end);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBe(2 * 60 * 60 * 1000); // 2 hours in ms
    });

    it('should return negative value when end is before start', () => {
      const start = '2023-01-19T12:00:00.000Z';
      const end = '2023-01-19T10:00:00.000Z';
      const result = calculateDifference(start, end);
      
      expect(result).toBeLessThan(0);
      expect(result).toBe(-2 * 60 * 60 * 1000); // -2 hours in ms
    });

    it('should return zero when dates are the same', () => {
      const date = '2023-01-19T10:00:00.000Z';
      const result = calculateDifference(date, date);
      
      expect(result).toBe(0);
    });
  });

  describe('time periods', () => {
    it('should calculate difference in milliseconds', () => {
      const start = '2023-01-19T10:00:00.000Z';
      const end = '2023-01-19T10:00:01.500Z';
      const result = calculateDifference(start, end);
      
      expect(result).toBe(1500); // 1.5 seconds
    });

    it('should calculate difference across days', () => {
      const start = '2023-01-19T23:00:00.000Z';
      const end = '2023-01-20T01:00:00.000Z';
      const result = calculateDifference(start, end);
      
      expect(result).toBe(2 * 60 * 60 * 1000); // 2 hours
    });

    it('should calculate difference across months', () => {
      const start = '2023-01-31T00:00:00.000Z';
      const end = '2023-02-01T00:00:00.000Z';
      const result = calculateDifference(start, end);
      
      expect(result).toBe(24 * 60 * 60 * 1000); // 24 hours
    });
  });

  describe('fallback to current time', () => {
    it('should use current time when endDate is empty string', () => {
      const start = '2023-01-19T10:00:00.000Z';
      const result = calculateDifference(start, '');
      
      // Should be greater than the time since start date (which is in the past)
      expect(result).toBeGreaterThan(0);
      // Should be a large number (years worth of milliseconds)
      expect(result).toBeGreaterThan(365 * 24 * 60 * 60 * 1000);
    });

    it('should use current time when endDate is null', () => {
      const start = '2023-01-19T10:00:00.000Z';
      const result = calculateDifference(start, null as any);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeGreaterThan(365 * 24 * 60 * 60 * 1000);
    });

    it('should use current time when endDate is undefined', () => {
      const start = '2023-01-19T10:00:00.000Z';
      const result = calculateDifference(start, undefined as any);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeGreaterThan(365 * 24 * 60 * 60 * 1000);
    });
  });

  describe('realistic scenarios', () => {
    it('should calculate SLA-relevant time periods (under 8 hours)', () => {
      const start = '2023-01-19T09:00:00.000Z';
      const end = '2023-01-19T16:30:00.000Z';
      const result = calculateDifference(start, end);
      
      const expectedMs = 7.5 * 60 * 60 * 1000; // 7.5 hours
      expect(result).toBe(expectedMs);
    });

    it('should calculate SLA breach period (over 8 hours)', () => {
      const start = '2023-01-19T09:00:00.000Z';
      const end = '2023-01-19T18:00:00.000Z';
      const result = calculateDifference(start, end);
      
      const expectedMs = 9 * 60 * 60 * 1000; // 9 hours
      expect(result).toBe(expectedMs);
    });

    it('should calculate multi-day resolution time', () => {
      const start = '2023-01-19T09:00:00.000Z';
      const end = '2023-01-21T15:00:00.000Z';
      const result = calculateDifference(start, end);
      
      const expectedMs = (2 * 24 + 6) * 60 * 60 * 1000; // 2 days 6 hours
      expect(result).toBe(expectedMs);
    });
  });
});

describe('formatDuration', () => {
  describe('basic time units', () => {
    it('should format minutes only', () => {
      const result = formatDuration(5 * 60 * 1000); // 5 minutes
      expect(result).toBe('5m');
    });

    it('should format hours and minutes', () => {
      const result = formatDuration(90 * 60 * 1000); // 90 minutes = 1h 30m
      expect(result).toBe('1h 30m');
    });

    it('should format days, hours, and minutes', () => {
      const result = formatDuration(50 * 60 * 60 * 1000); // 50 hours = 2d 2h
      expect(result).toBe('2d 2h');
    });

    it('should format days, hours, and minutes combined', () => {
      const result = formatDuration((2 * 24 * 60 + 3 * 60 + 45) * 60 * 1000); // 2d 3h 45m
      expect(result).toBe('2d 3h 45m');
    });
  });

  describe('edge cases', () => {
    it('should handle zero duration', () => {
      const result = formatDuration(0);
      expect(result).toBe('');
    });

    it('should handle default parameter (no duration)', () => {
      const result = formatDuration();
      expect(result).toBe('');
    });

    it('should handle exactly 1 hour', () => {
      const result = formatDuration(60 * 60 * 1000);
      expect(result).toBe('1h');
    });

    it('should handle exactly 1 day', () => {
      const result = formatDuration(24 * 60 * 60 * 1000);
      expect(result).toBe('1d');
    });

    it('should omit zero units', () => {
      const result = formatDuration(2 * 24 * 60 * 60 * 1000); // exactly 2 days
      expect(result).toBe('2d');
    });
  });

  describe('in progress flag', () => {
    it('should add "In Progress:" prefix when flag is true', () => {
      const result = formatDuration(90 * 60 * 1000, true);
      expect(result).toBe('In Progress: 1h 30m');
    });

    it('should not add prefix when flag is false', () => {
      const result = formatDuration(90 * 60 * 1000, false);
      expect(result).toBe('1h 30m');
    });

    it('should show "In Progress:" even with zero duration', () => {
      const result = formatDuration(0, true);
      expect(result).toBe('In Progress:');
    });
  });

  describe('realistic scenarios', () => {
    it('should format 8 hour SLA threshold', () => {
      const result = formatDuration(8 * 60 * 60 * 1000);
      expect(result).toBe('8h');
    });

    it('should format matter slightly over SLA', () => {
      const result = formatDuration(8.5 * 60 * 60 * 1000);
      expect(result).toBe('8h 30m');
    });

    it('should format multi-day matter', () => {
      const result = formatDuration(3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000);
      expect(result).toBe('3d 4h');
    });
  });
});