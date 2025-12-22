import { describe, it, expect } from 'vitest';
import { sortMatters } from './sort-utils.js';
import { createMockMatter } from '../test-utils.js';
import { TransformedMatter } from '../../types/types.js';

describe('sortMatters', () => {
  describe('computed field sorting (SLA and resolution time)', () => {
    it('should sort by SLA in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {}, 100),
        createMockMatter('2', {}, 50),
        createMockMatter('3', {}, 200),
      ];

      const sorted = sortMatters([...matters], 'sla', 'asc');
      expect(sorted[0].id).toBe('2'); // 50
      expect(sorted[1].id).toBe('1'); // 100
      expect(sorted[2].id).toBe('3'); // 200
    });

    it('should sort by SLA in descending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {}, 100),
        createMockMatter('2', {}, 50),
        createMockMatter('3', {}, 200),
      ];

      const sorted = sortMatters([...matters], 'sla', 'desc');
      expect(sorted[0].id).toBe('3'); // 200
      expect(sorted[1].id).toBe('1'); // 100
      expect(sorted[2].id).toBe('2'); // 50
    });

    it('should handle null SLA values', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {}, 100),
        createMockMatter('2', {}, null),
        createMockMatter('3', {}, 50),
      ];

      const sorted = sortMatters([...matters], 'sla', 'asc');
      expect(sorted[0].id).toBe('3'); // 50
      expect(sorted[1].id).toBe('1'); // 100
      expect(sorted[2].id).toBe('2'); // null (sorted last)
    });

    it('should sort by resolution_time in ascending order', () => {
      const matters: TransformedMatter[] = [
        {
          ...createMockMatter('1', {}),
          cycleTime: {
            resolutionTimeMs: 5000,
            resolutionTimeFormatted: '',
            isInProgress: false,
            startedAt: null,
            completedAt: null
          },
        },
        {
          ...createMockMatter('2', {}),
          cycleTime: {
            resolutionTimeMs: 2000,
            resolutionTimeFormatted: '',
            isInProgress: false,
            startedAt: null,
            completedAt: null
          },
        },
        {
          ...createMockMatter('3', {}),
          cycleTime: {
            resolutionTimeMs: 10000,
            resolutionTimeFormatted: '',
            isInProgress: false,
            startedAt: null,
            completedAt: null
          },
        },
      ];

      const sorted = sortMatters([...matters], 'resolution_time', 'asc');
      expect(sorted[0].id).toBe('2'); // 2000
      expect(sorted[1].id).toBe('1'); // 5000
      expect(sorted[2].id).toBe('3'); // 10000
    });

    it('should sort by resolution_time in descending order', () => {
      const matters: TransformedMatter[] = [
        {
          ...createMockMatter('1', {}),
          cycleTime: {
            resolutionTimeMs: 5000,
            resolutionTimeFormatted: '',
            isInProgress: false,
            startedAt: null,
            completedAt: null
          },
        },
        {
          ...createMockMatter('2', {}),
          cycleTime: {
            resolutionTimeMs: 2000,
            resolutionTimeFormatted: '',
            isInProgress: false,
            startedAt: null,
            completedAt: null
          },
        },
        {
          ...createMockMatter('3', {}),
          cycleTime: {
            resolutionTimeMs: 10000,
            resolutionTimeFormatted: '',
            isInProgress: false,
            startedAt: null,
            completedAt: null
          },
        },
      ];

      const sorted = sortMatters([...matters], 'resolution_time', 'desc');
      expect(sorted[0].id).toBe('3'); // 10000
      expect(sorted[1].id).toBe('1'); // 5000
      expect(sorted[2].id).toBe('2'); // 2000
    });

    it('should handle null resolution_time values', () => {
      const matters: TransformedMatter[] = [
        {
          ...createMockMatter('1', {}),
          cycleTime: {
            resolutionTimeMs: 5000,
            resolutionTimeFormatted: '',
            isInProgress: false,
            startedAt: null,
            completedAt: null
          },
        },
        {
          ...createMockMatter('2', {}),
          // @ts-expect-error Testing null resolution time
          cycleTime: null,
        },
        {
          ...createMockMatter('3', {}),
          cycleTime: {
            resolutionTimeMs: 2000,
            resolutionTimeFormatted: '',
            isInProgress: false,
            startedAt: null,
            completedAt: null
          },
        },
      ];

      const sorted = sortMatters([...matters], 'resolution_time', 'asc');
      expect(sorted[0].id).toBe('3'); // 2000
      expect(sorted[1].id).toBe('1'); // 5000
      expect(sorted[2].id).toBe('2'); // null (sorted last)
    });
  });
});
