import { describe, it, expect } from 'vitest';
import { formatDuration, calculateCycleTime, calculateSLAStatus } from './time-utils.js';
import { TransitionInfo } from '../repo/matter_repo.js';
import { SLAStatusEnum, StatusGroupEnum } from './cycle_time_service.js';

describe('formatDuration', () => {
  describe('basic time units', () => {
    it('should format minutes only', () => {
      const result = formatDuration(5 * 60 * 1000, 'Done'); // 5 minutes
      expect(result).toBe('5mins');
    });

    it('should format hours and minutes', () => {
      const result = formatDuration(90 * 60 * 1000, 'Done'); // 90 minutes = 1h 30m
      expect(result).toBe('1h 30mins');
    });

    it('should format days, hours, and minutes', () => {
      const result = formatDuration(50 * 60 * 60 * 1000, 'Done'); // 50 hours = 2d 2h
      expect(result).toBe('2d 2h');
    });

    it('should format days, hours, and minutes combined', () => {
      const result = formatDuration((2 * 24 * 60 + 3 * 60 + 45) * 60 * 1000, 'Done'); // 2d 3h 45m
      expect(result).toBe('2d 3h 45mins');
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
      expect(result).toBe('In Progress: 1h 30mins');
    });

    it('should add "In Progress:" prefix for To Do status', () => {
      const result = formatDuration(90 * 60 * 1000, 'To Do');
      expect(result).toBe('In Progress: 1h 30mins');
    });

    it('should not add prefix for Done status', () => {
      const result = formatDuration(90 * 60 * 1000, 'Done');
      expect(result).toBe('1h 30mins');
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
      expect(result).toBe('8h 30mins');
    });

    it('should format multi-day matter', () => {
      const result = formatDuration(3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000, 'Done');
      expect(result).toBe('3d 4h');
    });

    it('should format matter with more than 365 days', () => {
      const result = formatDuration(400 * 24 * 60 * 60 * 1000, 'Done'); // 400 days
      expect(result).toBe('1y 1m 4d');
    });

    it('should format matter with more than 365 days with hours and minutes', () => {
      const result = formatDuration((400 * 24 * 60 + 5 * 60 + 30) * 60 * 1000, 'Done'); // 400d 5h 30m
      expect(result).toBe('1y 1m 4d 5h 30mins');
    });

    it('should format matter with more than 365 days with In Progress prefix', () => {
      const result = formatDuration((400 * 24 * 60 + 5 * 60 + 30) * 60 * 1000, 'In Progress'); // 400d 5h 30m
      expect(result).toBe('In Progress: 1y 1m 4d 5h 30mins');
    });
  });
});

describe('calculateCycleTime', () => {
  describe('completed matters', () => {
    it('should calculate cycle time for completed matter (Done status)', () => {
      const transitionInfo: TransitionInfo = {
        totalDurationMs: 5 * 60 * 60 * 1000, // 5 hours
        transitions: [
          {
            name: StatusGroupEnum.TO_DO,
            changed_at: '2025-01-01T10:00:00Z',
            id: '1',
            status_from: '1',
            status_to: '2',
            total_duration_ms: 5 * 60 * 60 * 1000
          },
          {
            name: StatusGroupEnum.IN_PROGRESS,
            changed_at: '2025-01-01T11:00:00Z',
            id: '2',
            status_from: '2',
            status_to: '3',
            total_duration_ms: 5 * 60 * 60 * 1000
          },
          {
            name: StatusGroupEnum.DONE,
            changed_at: '2025-01-01T15:00:00Z',
            id: '3',
            status_from: '3',
            status_to: '4',
            total_duration_ms: 5 * 60 * 60 * 1000
          }
        ]
      };

      const result = calculateCycleTime(transitionInfo);

      expect(result.resolutionTimeMs).toBe(5 * 60 * 60 * 1000);
      expect(result.resolutionTimeFormatted).toBe('5h');
      expect(result.isInProgress).toBe(false);
      expect(result.startedAt).toEqual('2025-01-01T10:00:00Z');
      expect(result.completedAt).toEqual('2025-01-01T15:00:00Z');
    });

    it('should handle matter completed in under an hour', () => {
      const transitionInfo: TransitionInfo = {
        totalDurationMs: 30 * 60 * 1000, // 30 minutes
        transitions: [
          {
            name: StatusGroupEnum.IN_PROGRESS,
            changed_at: '2025-01-01T10:00:00Z',
            id: '1',
            status_from: '1',
            status_to: '2',
            total_duration_ms: 30 * 60 * 1000
          },
          {
            name: StatusGroupEnum.DONE,
            changed_at: '2025-01-01T10:30:00Z',
            id: '2',
            status_from: '2',
            status_to: '3',
            total_duration_ms: 30 * 60 * 1000
          }
        ]
      };

      const result = calculateCycleTime(transitionInfo);

      expect(result.resolutionTimeMs).toBe(30 * 60 * 1000);
      expect(result.resolutionTimeFormatted).toBe('30mins');
      expect(result.isInProgress).toBe(false);
      expect(result.completedAt).toEqual('2025-01-01T10:30:00Z');
    });

    it('should handle matter completed after multiple days', () => {
      const transitionInfo: TransitionInfo = {
        totalDurationMs: (3 * 24 * 60 + 5 * 60 + 15) * 60 * 1000, // 3d 5h 15m
        transitions: [
          {
            name: StatusGroupEnum.TO_DO,
            changed_at: '2025-01-01T10:00:00Z',
            id: '1',
            status_from: '1',
            status_to: '2',
            total_duration_ms: (3 * 24 * 60 + 5 * 60 + 15) * 60 * 1000
          },
          {
            name: StatusGroupEnum.DONE,
            changed_at: '2025-01-04T15:15:00Z',
            id: '2',
            status_from: '2',
            status_to: '3',
            total_duration_ms: (3 * 24 * 60 + 5 * 60 + 15) * 60 * 1000
          }
        ]
      };

      const result = calculateCycleTime(transitionInfo);

      expect(result.resolutionTimeMs).toBe((3 * 24 * 60 + 5 * 60 + 15) * 60 * 1000);
      expect(result.resolutionTimeFormatted).toContain('3d');
      expect(result.resolutionTimeFormatted).toContain('5h');
      expect(result.resolutionTimeFormatted).toContain('15mins');
      expect(result.isInProgress).toBe(false);
    });
  });

  describe('in progress matters', () => {
    it('should handle matter in To Do status', () => {
      const transitionInfo: TransitionInfo = {
        totalDurationMs: 0,
        transitions: [
          {
            name: StatusGroupEnum.TO_DO,
            changed_at: '2025-01-01T10:00:00Z',
            id: '1',
            status_from: '1',
            status_to: '2',
            total_duration_ms: 0
          }
        ]
      };

      const result = calculateCycleTime(transitionInfo);

      expect(result.resolutionTimeMs).toBe(0);
      expect(result.resolutionTimeFormatted).toBe('-');
      expect(result.isInProgress).toBe(true);
      expect(result.startedAt).toEqual('2025-01-01T10:00:00Z');
      expect(result.completedAt).toBe(null);
    });

    it('should handle matter in In Progress status', () => {
      const transitionInfo: TransitionInfo = {
        totalDurationMs: 2 * 60 * 60 * 1000, // 2 hours
        transitions: [
          {
            name: StatusGroupEnum.TO_DO,
            changed_at: '2025-01-01T10:00:00Z',
            id: '1',
            status_from: '1',
            status_to: '2',
            total_duration_ms: 2 * 60 * 60 * 1000
          },
          {
            name: StatusGroupEnum.IN_PROGRESS,
            changed_at: '2025-01-01T10:00:00Z',
            id: '2',
            status_from: '2',
            status_to: '3',
            total_duration_ms: 2 * 60 * 60 * 1000
          }
        ]
      };

      const result = calculateCycleTime(transitionInfo);

      expect(result.resolutionTimeMs).toBe(2 * 60 * 60 * 1000);
      expect(result.resolutionTimeFormatted).toBe('In Progress: 2h');
      expect(result.isInProgress).toBe(true);
      expect(result.completedAt).toBe(null);
    });

    it('should handle matter that went back to To Do', () => {
      const transitionInfo: TransitionInfo = {
        totalDurationMs: 3 * 60 * 60 * 1000, // 3 hours
        transitions: [
          {
            name: StatusGroupEnum.TO_DO,
            changed_at: '2025-01-01T10:00:00Z',
            id: '1',
            status_from: '1',
            status_to: '2',
            total_duration_ms: 3 * 60 * 60 * 1000
          },
          {
            name: StatusGroupEnum.IN_PROGRESS,
            changed_at: '2025-01-01T10:00:00Z',
            id: '2',
            status_from: '2',
            status_to: '3',
            total_duration_ms: 3 * 60 * 60 * 1000
          },
          {
            name: StatusGroupEnum.TO_DO,
            changed_at: '2025-01-01T12:00:00Z',
            id: '3',
            status_from: '3',
            status_to: '1',
            total_duration_ms: 3 * 60 * 60 * 1000
          }
        ]
      };

      const result = calculateCycleTime(transitionInfo);

      expect(result.isInProgress).toBe(true);
      expect(result.resolutionTimeFormatted).toBe('In Progress: 3h');
      expect(result.completedAt).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('should handle single transition to Done', () => {
      const transitionInfo: TransitionInfo = {
        totalDurationMs: 0,
        transitions: [
          {
            name: StatusGroupEnum.DONE,
            changed_at: '2025-01-01T10:00:00Z',
            id: '1',
            status_from: '1',
            status_to: '2',
            total_duration_ms: 0
          }
        ]
      };

      const result = calculateCycleTime(transitionInfo);

      expect(result.resolutionTimeMs).toBe(0);
      expect(result.resolutionTimeFormatted).toBe('');
      expect(result.isInProgress).toBe(false);
      expect(result.completedAt).toEqual('2025-01-01T10:00:00Z');
    });

    it('should use first transition as start time', () => {
      const startDate = '2025-01-01T09:00:00Z';
      const transitionInfo: TransitionInfo = {
        totalDurationMs: 1000,
        transitions: [
          {
            name: StatusGroupEnum.TO_DO,
            changed_at: startDate,
            id: '1',
            status_from: '1',
            status_to: '2',
            total_duration_ms: 1000
          },
          {
            name: StatusGroupEnum.IN_PROGRESS,
            changed_at: '2025-01-01T10:00:00Z',
            id: '2',
            status_from: '2',
            status_to: '3',
            total_duration_ms: 1000
          }
        ]
      };

      const result = calculateCycleTime(transitionInfo);

      expect(result.startedAt).toEqual(startDate);
    });
  });
});

describe('calculateSLAStatus', () => {
  const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

  describe('in progress matters', () => {
    it('should return IN_PROGRESS when in progress and under threshold', () => {
      const result = calculateSLAStatus(5 * 60 * 60 * 1000, EIGHT_HOURS_MS, true);
      expect(result).toBe(SLAStatusEnum.IN_PROGRESS);
    });

    it('should return IN_PROGRESS when in progress at exact threshold', () => {
      const result = calculateSLAStatus(EIGHT_HOURS_MS, EIGHT_HOURS_MS, true);
      expect(result).toBe(SLAStatusEnum.IN_PROGRESS);
    });

    it('should return BREACHED when in progress and over threshold', () => {
      const result = calculateSLAStatus(10 * 60 * 60 * 1000, EIGHT_HOURS_MS, true);
      expect(result).toBe(SLAStatusEnum.BREACHED);
    });

    it('should return IN_PROGRESS when resolution time is null', () => {
      const result = calculateSLAStatus(null as never, EIGHT_HOURS_MS, false);
      expect(result).toBe(SLAStatusEnum.IN_PROGRESS);
    });

    it('should return IN_PROGRESS when in progress with zero duration', () => {
      const result = calculateSLAStatus(0, EIGHT_HOURS_MS, true);
      expect(result).toBe(SLAStatusEnum.IN_PROGRESS);
    });
  });

  describe('completed matters', () => {
    it('should return MET when completed under threshold', () => {
      const result = calculateSLAStatus(5 * 60 * 60 * 1000, EIGHT_HOURS_MS, false);
      expect(result).toBe(SLAStatusEnum.MET);
    });

    it('should return MET when completed at exact threshold', () => {
      const result = calculateSLAStatus(EIGHT_HOURS_MS, EIGHT_HOURS_MS, false);
      expect(result).toBe(SLAStatusEnum.MET);
    });

    it('should return BREACHED when completed over threshold', () => {
      const result = calculateSLAStatus(10 * 60 * 60 * 1000, EIGHT_HOURS_MS, false);
      expect(result).toBe(SLAStatusEnum.BREACHED);
    });

    it('should return MET when completed with zero duration', () => {
      const result = calculateSLAStatus(0, EIGHT_HOURS_MS, false);
      expect(result).toBe(SLAStatusEnum.MET);
    });

    it('should return BREACHED when completed just over threshold', () => {
      const result = calculateSLAStatus(EIGHT_HOURS_MS + 1, EIGHT_HOURS_MS, false);
      expect(result).toBe(SLAStatusEnum.BREACHED);
    });
  });

  describe('edge cases', () => {
    it('should handle very small threshold', () => {
      const result = calculateSLAStatus(1000, 500, false);
      expect(result).toBe(SLAStatusEnum.BREACHED);
    });

    it('should handle very large duration', () => {
      const result = calculateSLAStatus(100 * 24 * 60 * 60 * 1000, EIGHT_HOURS_MS, false);
      expect(result).toBe(SLAStatusEnum.BREACHED);
    });

    it('should use default values correctly', () => {
      const result = calculateSLAStatus(undefined as never, EIGHT_HOURS_MS);
      expect(result).toBe(SLAStatusEnum.MET);
    });

    it('should handle different SLA thresholds', () => {
      const fourHours = 4 * 60 * 60 * 1000;
      const result1 = calculateSLAStatus(3 * 60 * 60 * 1000, fourHours, false);
      const result2 = calculateSLAStatus(5 * 60 * 60 * 1000, fourHours, false);
      
      expect(result1).toBe(SLAStatusEnum.MET);
      expect(result2).toBe(SLAStatusEnum.BREACHED);
    });
  });
});