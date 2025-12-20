import { TransformedMatter } from '../types/types.js';

export function createMockMatter(
  id: string,
  fields: Record<string, any> = {}
): TransformedMatter {
  return {
    id,
    boardId: 'board-1',
    fields,
    sla: 'In Progress',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    cycleTime: {
      resolutionTimeMs: 0,
      resolutionTimeFormatted: '-',
      isInProgress: true,
      startedAt: null,
      completedAt: null,
    },
  };
}
