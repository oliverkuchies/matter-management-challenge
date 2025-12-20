import { TransformedMatter, CurrencyValue, UserValue, FieldValueType } from '../../types/types.js';

/**
 * Sorts matters based on the specified field and order
 * @param matters - Array of transformed matters to sort
 * @param sortBy - Field name to sort by (can be a field name or 'created_at', 'updated_at', 'sla', 'resolution_time')
 * @param sortOrder - Sort order ('asc' or 'desc')
 * @returns Sorted array of matters
 */
export function sortMatters(
  matters: TransformedMatter[],
  sortBy: string,
  sortOrder: string,
): TransformedMatter[] {
  return matters.sort((a, b) => {
    let aValue: FieldValueType;
    let bValue: FieldValueType;

    // Handle table columns
    if (sortBy === 'created_at') {
      aValue = a.createdAt;
      bValue = b.createdAt;
    } else if (sortBy === 'updated_at') {
      aValue = a.updatedAt;
      bValue = b.updatedAt;
    } else if (sortBy === 'sla') {
      aValue = a.sla || null;
      bValue = b.sla || null;
    } else if (sortBy === 'resolution_time') {
      aValue = a.cycleTime?.resolutionTimeMs ?? null;
      bValue = b.cycleTime?.resolutionTimeMs ?? null;
    } else {
      // Handle field values
      const aField = a.fields[sortBy];
      const bField = b.fields[sortBy];

      if (!aField && !bField) {
        return 0;
      }

      // For all field types, prioritize displayValue if available, as it's human-readable
      const fieldType = aField?.fieldType || bField?.fieldType;

      switch (fieldType) {
        case 'user':
          aValue = (aField?.value as UserValue)?.displayName ?? null;
          bValue = (bField?.value as UserValue)?.displayName ?? null;
          break;
        case 'currency':
          aValue = (aField?.value as CurrencyValue)?.amount ?? null;
          bValue = (bField?.value as CurrencyValue)?.amount ?? null;
          break;
        case 'status':
          // Use displayValue for status (the label)
          aValue = aField?.displayValue ?? null;
          bValue = bField?.displayValue ?? null;
          break;
        case 'select':
          // Use displayValue for select (the label)
          aValue = aField?.displayValue ?? null;
          bValue = bField?.displayValue ?? null;
          break;
        case 'date':
          // Ensure dates are Date objects for proper comparison
          aValue = aField?.value ? new Date(aField.value as string | Date) : null;
          bValue = bField?.value ? new Date(bField.value as string | Date) : null;
          break;
        case 'boolean':
          // Convert boolean to number for consistent sorting (false=0, true=1)
          aValue = aField?.value === true ? 1 : aField?.value === false ? 0 : null;
          bValue = bField?.value === true ? 1 : bField?.value === false ? 0 : null;
          break;
        case 'text':
          // Use value for text, convert to lowercase for case-insensitive comparison
          aValue = aField?.value ? String(aField.value).toLowerCase() : null;
          bValue = bField?.value ? String(bField.value).toLowerCase() : null;
          break;
        case 'number':
          // Ensure numbers are parsed correctly
          aValue =
            typeof aField?.value === 'number'
              ? aField.value
              : aField?.value
                ? parseFloat(String(aField.value))
                : null;
          bValue =
            typeof bField?.value === 'number'
              ? bField.value
              : bField?.value
                ? parseFloat(String(bField.value))
                : null;
          break;
        default:
          // Fallback to displayValue or value
          aValue = aField?.displayValue ?? aField?.value ?? null;
          bValue = bField?.displayValue ?? bField?.value ?? null;
      }
    }

    // Handle null values - nulls sort to the end
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
    if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      // Fallback comparison
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}
