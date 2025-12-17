import { Matter } from '../../src/types/matter';

/**
 * Creates a mock Matter object for testing purposes
 * @param id - Unique identifier for the matter
 * @param sla - SLA status: 'In Progress', 'Met', or 'Breached'
 * @param resolutionTimeFormatted - Formatted resolution time string (e.g., "2h 30m")
 * @param statusDisplayValue - Display value for the status field
 * @returns A complete Matter object with all required fields
 */
export const createMockMatter = (
  id: string,
  sla: 'In Progress' | 'Met' | 'Breached',
  resolutionTimeFormatted: string,
  statusDisplayValue: string,
): Matter => ({
  id,
  boardId: 'board-1',
  sla,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  cycleTime: {
    resolutionTimeMs: 3600000,
    resolutionTimeFormatted,
    isInProgress: sla === 'In Progress',
    startedAt: '2025-01-01T00:00:00Z',
    completedAt: sla === 'In Progress' ? null : '2025-01-01T01:00:00Z',
  },
  fields: {
    subject: {
      fieldId: 'subject-field',
      fieldName: 'subject',
      fieldType: 'text',
      value: `Test Matter ${id}`,
      displayValue: `Test Matter ${id}`,
    },
    'Case Number': {
      fieldId: 'case-number-field',
      fieldName: 'Case Number',
      fieldType: 'text',
      value: `CASE-${id}`,
      displayValue: `CASE-${id}`,
    },
    Status: {
      fieldId: 'status-field',
      fieldName: 'Status',
      fieldType: 'status',
      value: {
        statusId: 'status-1',
        groupName: 'In Progress',
        label: statusDisplayValue,
      },
      displayValue: statusDisplayValue,
    },
  },
});
