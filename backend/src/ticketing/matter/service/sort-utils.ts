import { Matter, FieldValueType } from '../../types/types.js';

/**
 * Sorts matters based on the specified field and order
 * @param matters - Array of transformed matters to sort
 * @param sortBy - Field name to sort by (can be a field name or 'created_at', 'updated_at', 'sla', 'resolution_time')
 * @param sortOrder - Sort order ('asc' or 'desc')
 * @returns Sorted array of matters
 */
export function sortMatters(
  matters: Matter[],
  sortBy: string,
  sortOrder: string,
): Matter[] {
  return matters.sort((a, b) => {
    let aValue: FieldValueType;
    let bValue: FieldValueType;

    // Handle table columns
    if (sortBy === 'sla') {
      aValue = a.sla || null;
      bValue = b.sla || null;
    } else if (sortBy === 'resolution_time') {
      aValue = a.cycleTime?.resolutionTimeMs ?? null;
      bValue = b.cycleTime?.resolutionTimeMs ?? null;
    } else {
      throw new Error(`Unsupported sortBy field: ${sortBy}`);
    }

    // Handle null values - nulls sort to the end
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
    if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      // Fallback comparison
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}
