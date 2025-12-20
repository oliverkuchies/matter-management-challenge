import { describe, it, expect } from 'vitest';
import { sortMatters } from './sort-utils.js';
import { createMockMatter } from '../test-utils.js';
import { TransformedMatter } from '../../types/types.js';
import { sortUtilsMock } from './sort-utils.mock.js';

describe('sortMatters', () => {
  describe('text field sorting', () => {
    it('should sort text fields in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          subject: {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'Zebra',
          },
        }),
        createMockMatter('2', {
          subject: {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'Apple',
          },
        }),
        createMockMatter('3', {
          subject: {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'Mango',
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'subject', 'asc');
      expect(sorted[0].id).toBe('2'); // Apple
      expect(sorted[1].id).toBe('3'); // Mango
      expect(sorted[2].id).toBe('1'); // Zebra
    });

    it('should sort text fields in descending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          subject: {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'Apple',
          },
        }),
        createMockMatter('2', {
          subject: {
            fieldId: 'field-1',
            fieldName: 'subject',
            fieldType: 'text',
            value: 'Zebra',
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'subject', 'desc');
      expect(sorted[0].id).toBe('2'); // Zebra
      expect(sorted[1].id).toBe('1'); // Apple
    });

    it('should handle case-insensitive text sorting', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { subject: { fieldType: 'text', value: 'banana' } }),
        createMockMatter('2', { subject: { fieldType: 'text', value: 'APPLE' } }),
        createMockMatter('3', { subject: { fieldType: 'text', value: 'Cherry' } }),
      ];

      const sorted = sortMatters([...matters], 'subject', 'asc');
      expect(sorted[0].id).toBe('2'); // APPLE
      expect(sorted[1].id).toBe('1'); // banana
      expect(sorted[2].id).toBe('3'); // Cherry
    });
  });

  describe('number field sorting', () => {
    it('should sort number fields in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          priority: { fieldType: 'number', value: 5 },
        }),
        createMockMatter('2', {
          priority: { fieldType: 'number', value: 1 },
        }),
        createMockMatter('3', {
          priority: { fieldType: 'number', value: 3 },
        }),
      ];

      const sorted = sortMatters([...matters], 'priority', 'asc');
      expect(sorted[0].id).toBe('2'); // 1
      expect(sorted[1].id).toBe('3'); // 3
      expect(sorted[2].id).toBe('1'); // 5
    });

    it('should sort number fields in descending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { priority: { fieldType: 'number', value: 1 } }),
        createMockMatter('2', { priority: { fieldType: 'number', value: 10 } }),
        createMockMatter('3', { priority: { fieldType: 'number', value: 5 } }),
      ];

      const sorted = sortMatters([...matters], 'priority', 'desc');
      expect(sorted[0].id).toBe('2'); // 10
      expect(sorted[1].id).toBe('3'); // 5
      expect(sorted[2].id).toBe('1'); // 1
    });
  });

  describe('date field sorting', () => {
    it('should sort date fields in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          dueDate: { fieldType: 'date', value: '2024-03-01T00:00:00Z' },
        }),
        createMockMatter('2', {
          dueDate: { fieldType: 'date', value: '2024-01-01T00:00:00Z' },
        }),
        createMockMatter('3', {
          dueDate: { fieldType: 'date', value: '2024-02-01T00:00:00Z' },
        }),
      ];

      const sorted = sortMatters([...matters], 'dueDate', 'asc');
      expect(sorted[0].id).toBe('2'); // Jan
      expect(sorted[1].id).toBe('3'); // Feb
      expect(sorted[2].id).toBe('1'); // Mar
    });

    it('should sort date fields in descending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { dueDate: { fieldType: 'date', value: '2024-01-01T00:00:00Z' } }),
        createMockMatter('2', { dueDate: { fieldType: 'date', value: '2024-03-01T00:00:00Z' } }),
      ];

      const sorted = sortMatters([...matters], 'dueDate', 'desc');
      expect(sorted[0].id).toBe('2'); // Mar
      expect(sorted[1].id).toBe('1'); // Jan
    });
  });

  describe('currency field sorting', () => {
    it('should sort currency fields by amount in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          contractValue: {
            fieldType: 'currency',
            value: { amount: 5000, currency: 'USD' },
          },
        }),
        createMockMatter('2', {
          contractValue: {
            fieldType: 'currency',
            value: { amount: 1000, currency: 'USD' },
          },
        }),
        createMockMatter('3', {
          contractValue: {
            fieldType: 'currency',
            value: { amount: 3000, currency: 'USD' },
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'contractValue', 'asc');
      expect(sorted[0].id).toBe('2'); // 1000
      expect(sorted[1].id).toBe('3'); // 3000
      expect(sorted[2].id).toBe('1'); // 5000
    });
  });

  describe('status field sorting', () => {
    it('should sort status fields by displayValue in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          status: {
            fieldType: 'status',
            displayValue: 'In Progress',
            value: { statusId: '1', label: 'In Progress', groupName: 'Active' },
          },
        }),
        createMockMatter('2', {
          status: {
            fieldType: 'status',
            displayValue: 'Done',
            value: { statusId: '2', label: 'Done', groupName: 'Complete' },
          },
        }),
        createMockMatter('3', {
          status: {
            fieldType: 'status',
            displayValue: 'To Do',
            value: { statusId: '3', label: 'To Do', groupName: 'Backlog' },
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'status', 'asc');
      expect(sorted[0].id).toBe('2'); // Done
      expect(sorted[1].id).toBe('1'); // In Progress
      expect(sorted[2].id).toBe('3'); // To Do
    });
  });

  describe('boolean field sorting', () => {
    it('should sort boolean fields with false before true in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { urgent: { fieldType: 'boolean', value: true } }),
        createMockMatter('2', { urgent: { fieldType: 'boolean', value: false } }),
        createMockMatter('3', { urgent: { fieldType: 'boolean', value: true } }),
      ];

      const sorted = sortMatters([...matters], 'urgent', 'asc');
      expect(sorted[0].fields.urgent?.value).toBe(false);
      expect(sorted[1].fields.urgent?.value).toBe(true);
      expect(sorted[2].fields.urgent?.value).toBe(true);
    });

    it('should handle boolean fields with null values', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { urgent: { fieldType: 'boolean', value: true } }),
        createMockMatter('2', { urgent: { fieldType: 'boolean', value: null } }),
        createMockMatter('3', { urgent: { fieldType: 'boolean', value: false } }),
      ];

      const sorted = sortMatters([...matters], 'urgent', 'asc');
      expect(sorted[0].fields.urgent?.value).toBe(false);
      expect(sorted[1].fields.urgent?.value).toBe(true);
      expect(sorted[2].fields.urgent?.value).toBe(null);
    });
  });

  describe('select field sorting', () => {
    it('should sort select fields by displayValue in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          category: {
            fieldType: 'select',
            displayValue: 'Litigation',
            value: 'litigation-id',
          },
        }),
        createMockMatter('2', {
          category: {
            fieldType: 'select',
            displayValue: 'Contract Review',
            value: 'contract-id',
          },
        }),
        createMockMatter('3', {
          category: {
            fieldType: 'select',
            displayValue: 'Patent',
            value: 'patent-id',
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'category', 'asc');
      expect(sorted[0].id).toBe('2'); // Contract Review
      expect(sorted[1].id).toBe('1'); // Litigation
      expect(sorted[2].id).toBe('3'); // Patent
    });

    it('should sort select fields in descending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          category: {
            fieldType: 'select',
            displayValue: 'A-Category',
            value: 'a-id',
          },
        }),
        createMockMatter('2', {
          category: {
            fieldType: 'select',
            displayValue: 'Z-Category',
            value: 'z-id',
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'category', 'desc');
      expect(sorted[0].id).toBe('2'); // Z-Category
      expect(sorted[1].id).toBe('1'); // A-Category
    });
  });

  describe('user field sorting', () => {
    it('should sort user fields by displayName in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          assignee: {
            fieldType: 'user',
            value: {
              id: 1,
              email: 'zoe@example.com',
              firstName: 'Zoe',
              lastName: 'Anderson',
              displayName: 'Zoe Anderson',
            },
          },
        }),
        createMockMatter('2', {
          assignee: {
            fieldType: 'user',
            value: {
              id: 2,
              email: 'alice@example.com',
              firstName: 'Alice',
              lastName: 'Brown',
              displayName: 'Alice Brown',
            },
          },
        }),
        createMockMatter('3', {
          assignee: {
            fieldType: 'user',
            value: {
              id: 3,
              email: 'mike@example.com',
              firstName: 'Mike',
              lastName: 'Chen',
              displayName: 'Mike Chen',
            },
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'assignee', 'asc');
      expect(sorted[0].id).toBe('2'); // Alice Brown
      expect(sorted[1].id).toBe('3'); // Mike Chen
      expect(sorted[2].id).toBe('1'); // Zoe Anderson
    });
  });

  describe('null value handling', () => {
    it('should sort null values to the end in ascending order', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { subject: { fieldType: 'text', value: 'Apple' } }),
        createMockMatter('2', {}), // No subject field
        createMockMatter('3', { subject: { fieldType: 'text', value: 'Zebra' } }),
      ];

      const sorted = sortMatters([...matters], 'subject', 'asc');
      expect(sorted[0].id).toBe('1'); // Apple
      expect(sorted[1].id).toBe('3'); // Zebra
      expect(sorted[2].id).toBe('2'); // null
    });

    it('should handle both fields being null', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {}), // No field
        createMockMatter('2', {}), // No field
        createMockMatter('3', { subject: { fieldType: 'text', value: 'Apple' } }),
      ];

      const sorted = sortMatters([...matters], 'subject', 'asc');
      expect(sorted[0].id).toBe('3'); // Apple
      // Order of null matters doesn't matter, both should be at the end
      expect([sorted[1].id, sorted[2].id]).toContain('1');
      expect([sorted[1].id, sorted[2].id]).toContain('2');
    });

    it('should handle null field values', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { subject: { fieldType: 'text', value: null } }),
        createMockMatter('2', { subject: { fieldType: 'text', value: 'Apple' } }),
        createMockMatter('3', { subject: { fieldType: 'text', value: null } }),
      ];

      const sorted = sortMatters([...matters], 'subject', 'asc');
      expect(sorted[0].id).toBe('2'); // Apple
      // null values should be at end
      expect([sorted[1].id, sorted[2].id]).toContain('1');
      expect([sorted[1].id, sorted[2].id]).toContain('3');
    });

    it('should handle date fields with null values', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { dueDate: { fieldType: 'date', value: null } }),
        createMockMatter('2', { dueDate: { fieldType: 'date', value: '2024-01-01T00:00:00Z' } }),
        createMockMatter('3', {}), // No dueDate field
      ];

      const sorted = sortMatters([...matters], 'dueDate', 'asc');
      expect(sorted[0].id).toBe('2'); // Jan
      expect([sorted[1].id, sorted[2].id]).toContain('1');
      expect([sorted[1].id, sorted[2].id]).toContain('3');
    });
  });

  describe('SLA sorting', () => {
    it('should sort by SLA status', () => {
      const matters: TransformedMatter[] = [
        { ...createMockMatter('1'), sla: 'In Progress' },
        { ...createMockMatter('2'), sla: 'Breached' },
        { ...createMockMatter('3'), sla: 'Met' },
      ];

      const sorted = sortMatters([...matters], 'sla', 'asc');
      expect(sorted[0].sla).toBe('Breached');
      expect(sorted[1].sla).toBe('In Progress');
      expect(sorted[2].sla).toBe('Met');
    });
  });

  describe('resolution time sorting', () => {
    it('should sort by resolution time in ascending order', () => {
      const matters: TransformedMatter[] = [
        {
          ...createMockMatter('1'),
          cycleTime: {
            resolutionTimeMs: 5000,
            resolutionTimeFormatted: '5s',
            isInProgress: false,
            startedAt: '2024-01-01T00:00:00Z',
            completedAt: '2024-01-01T00:00:05Z',
          },
        },
        {
          ...createMockMatter('2'),
          cycleTime: {
            resolutionTimeMs: 1000,
            resolutionTimeFormatted: '1s',
            isInProgress: false,
            startedAt: '2024-01-01T00:00:00Z',
            completedAt: '2024-01-01T00:00:01Z',
          },
        },
        {
          ...createMockMatter('3'),
          cycleTime: {
            resolutionTimeMs: 3000,
            resolutionTimeFormatted: '3s',
            isInProgress: false,
            startedAt: '2024-01-01T00:00:00Z',
            completedAt: '2024-01-01T00:00:03Z',
          },
        },
      ];

      const sorted = sortMatters([...matters], 'resolution_time', 'asc');
      expect(sorted[0].id).toBe('2'); // 1000ms
      expect(sorted[1].id).toBe('3'); // 3000ms
      expect(sorted[2].id).toBe('1'); // 5000ms
    });
  });

  describe('created_at and updated_at sorting', () => {
    it('should sort by created_at in ascending order', () => {
      const matters: TransformedMatter[] = [
        { ...createMockMatter('1'), createdAt: '2024-03-01T00:00:00Z' },
        { ...createMockMatter('2'), createdAt: '2024-01-01T00:00:00Z' },
        { ...createMockMatter('3'), createdAt: '2024-02-01T00:00:00Z' },
      ];

      const sorted = sortMatters([...matters], 'created_at', 'asc');
      expect(sorted[0].id).toBe('2'); // Jan
      expect(sorted[1].id).toBe('3'); // Feb
      expect(sorted[2].id).toBe('1'); // Mar
    });

    it('should sort by updated_at in descending order', () => {
      const matters: TransformedMatter[] = [
        { ...createMockMatter('1'), updatedAt: '2024-01-01T00:00:00Z' },
        { ...createMockMatter('2'), updatedAt: '2024-03-01T00:00:00Z' },
        { ...createMockMatter('3'), updatedAt: '2024-02-01T00:00:00Z' },
      ];

      const sorted = sortMatters([...matters], 'updated_at', 'desc');
      expect(sorted[0].id).toBe('2'); // Mar
      expect(sorted[1].id).toBe('3'); // Feb
      expect(sorted[2].id).toBe('1'); // Jan
    });

    it('should sort by created_at in descending order and remain stable after status mutation', () => {
      const matters: TransformedMatter[] = [
        { 
          ...createMockMatter('1'), 
          createdAt: '2024-01-01T00:00:00Z',
          fields: {
            status: {
              fieldType: 'status',
              displayValue: 'To Do',
              value: { statusId: '1', groupName: 'Backlog' },
              fieldId: '',
              fieldName: 'status'
            }
          }
        },
        { 
          ...createMockMatter('2'), 
          createdAt: '2024-03-01T00:00:00Z',
          fields: {
            status: {
                fieldType: 'status',
                displayValue: 'In Progress',
                value: { statusId: '2', groupName: 'Active' },
                fieldId: '',
                fieldName: 'status'
            }
          }
        },
        { 
          ...createMockMatter('3'), 
          createdAt: '2024-02-01T00:00:00Z',
          fields: {
            status: {
              fieldType: 'status',
              displayValue: 'Done',
              value: { statusId: '3', groupName: 'Complete' },
              fieldId: '',
              fieldName: 'status'
            }
          }
        },
      ];

      const sorted = sortMatters([...matters], 'created_at', 'desc');
      
      // Verify initial sort order (desc by created_at)
      expect(sorted[0].id).toBe('2'); // Mar
      expect(sorted[1].id).toBe('3'); // Feb
      expect(sorted[2].id).toBe('1'); // Jan

      // Mutate the status of the first item
      if (sorted[0].fields.status) {
        sorted[0].fields.status.displayValue = 'Completed';
      }

      // Verify the order hasn't changed (sort is by created_at, not status)
      expect(sorted[0].id).toBe('2'); // Still Mar
      expect(sorted[1].id).toBe('3'); // Still Feb
      expect(sorted[2].id).toBe('1'); // Still Jan
      
      // Verify the mutation was applied
      expect(sorted[0].fields.status?.displayValue).toBe('Completed');
    });
  });

  describe('number parsing edge cases', () => {
    it('should parse string numbers correctly', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { score: { fieldType: 'number', value: '42.5' } }),
        createMockMatter('2', { score: { fieldType: 'number', value: '10.2' } }),
        createMockMatter('3', { score: { fieldType: 'number', value: '100' } }),
      ];

      const sorted = sortMatters([...matters], 'score', 'asc');
      expect(sorted[0].id).toBe('2'); // 10.2
      expect(sorted[1].id).toBe('1'); // 42.5
      expect(sorted[2].id).toBe('3'); // 100
    });

    it('should handle mixed number and string number values', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { score: { fieldType: 'number', value: 50 } }),
        createMockMatter('2', { score: { fieldType: 'number', value: '25.5' } }),
        createMockMatter('3', { score: { fieldType: 'number', value: 75 } }),
      ];

      const sorted = sortMatters([...matters], 'score', 'asc');
      expect(sorted[0].id).toBe('2'); // 25.5 (parsed)
      expect(sorted[1].id).toBe('1'); // 50
      expect(sorted[2].id).toBe('3'); // 75
    });

    it('should handle number field with null value', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', { score: { fieldType: 'number', value: 50 } }),
        createMockMatter('2', { score: { fieldType: 'number', value: null } }),
        createMockMatter('3', { score: { fieldType: 'number', value: 25 } }),
      ];

      const sorted = sortMatters([...matters], 'score', 'asc');
      expect(sorted[0].id).toBe('3'); // 25
      expect(sorted[1].id).toBe('1'); // 50
      expect(sorted[2].id).toBe('2'); // null
    });
  });

  describe('unknown field type fallback', () => {
    it('should use displayValue for unknown field types', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          custom: {
            fieldType: 'unknown' as any,
            displayValue: 'Zebra',
            value: 'some-value',
          },
        }),
        createMockMatter('2', {
          custom: {
            fieldType: 'unknown' as any,
            displayValue: 'Apple',
            value: 'other-value',
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'custom', 'asc');
      expect(sorted[0].id).toBe('2'); // Apple
      expect(sorted[1].id).toBe('1'); // Zebra
    });

    it('should fallback to value if displayValue is not present', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          custom: {
            fieldType: 'unknown' as any,
            value: 'zebra',
          },
        }),
        createMockMatter('2', {
          custom: {
            fieldType: 'unknown' as any,
            value: 'apple',
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'custom', 'asc');
      expect(sorted[0].id).toBe('2'); // apple
      expect(sorted[1].id).toBe('1'); // zebra
    });

    it('should use fallback comparison for non-standard value types', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          custom: {
            fieldType: 'custom' as any,
            value: 3 as any,
          },
        }),
        createMockMatter('2', {
          custom: {
            fieldType: 'custom' as any,
            value: 1 as any,
          },
        }),
        createMockMatter('3', {
          custom: {
            fieldType: 'custom' as any,
            value: 2 as any,
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'custom', 'asc');
      expect(sorted[0].id).toBe('2'); // 1
      expect(sorted[1].id).toBe('3'); // 2
      expect(sorted[2].id).toBe('1'); // 3
    });

    it('should handle equal values in fallback comparison', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          custom: {
            fieldType: 'custom' as any,
            value: 5 as any,
          },
        }),
        createMockMatter('2', {
          custom: {
            fieldType: 'custom' as any,
            value: 5 as any,
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'custom', 'asc');
      expect(sorted.length).toBe(2);
    });

    it('should handle null in default field type', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          custom: {
            fieldType: 'unknown' as any,
            value: 'test',
          },
        }),
        createMockMatter('2', {
          custom: {
            fieldType: 'unknown' as any,
            value: null,
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'custom', 'asc');
      expect(sorted[0].id).toBe('1'); // test
      expect(sorted[1].id).toBe('2'); // null
    });

    it('should use fallback comparison for boolean values in unknown field type', () => {
      const matters: TransformedMatter[] = [
        createMockMatter('1', {
          custom: {
            fieldType: 'unknown' as any,
            value: true as any,
          },
        }),
        createMockMatter('2', {
          custom: {
            fieldType: 'unknown' as any,
            value: false as any,
          },
        }),
      ];

      const sorted = sortMatters([...matters], 'custom', 'asc');
      // false < true in JavaScript, so false should come first
      expect(sorted[0].id).toBe('2'); // false
      expect(sorted[1].id).toBe('1'); // true
    });
  });

  describe('sort upon mutation of fields', () => {
    it ('should maintain sort order upon status field mutation', () => {
      const sorted = sortMatters(sortUtilsMock, 'created_at', 'desc');
      // Verify initial sort order (desc by created_at)
      const firstMatter = sorted[0];
      const secondMatter = sorted[1];
      const thirdMatter = sorted[2];

      expect(firstMatter.id).toBe('3'); // Most recent created_at
      expect(secondMatter.id).toBe('2');
      expect(thirdMatter.id).toBe('1'); // Oldest created_at

      // Mutate the status of the first item
      if (firstMatter.fields.status) {
        firstMatter.fields.status.displayValue = 'In Progress';
        firstMatter.fields.status.fieldId = 'c8db69d8-2e5e-4d83-b89f-9bcd599cb961';
        firstMatter.fields.status.fieldName = 'Status';
        firstMatter.fields.status.fieldType = 'status';
      }

      // Verify the order hasn't changed (sort is by created_at, not status)
      const reSorted = sortMatters([...sorted], 'created_at', 'desc');
      expect(reSorted[0].id).toBe('3'); // Still most recent created_at
      expect(reSorted[1].id).toBe('2');
      expect(reSorted[2].id).toBe('1'); // Still oldest created_at

      // Verify the mutation was applied
      expect(reSorted[0].fields.status?.displayValue).toBe('Completed');
    });
  });
});
