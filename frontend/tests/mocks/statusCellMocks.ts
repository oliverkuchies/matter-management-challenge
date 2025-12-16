import { FieldValue, StatusFieldValue } from '../../src/types/matter';

export const mockCurrentStatus: FieldValue = {
  fieldId: 'status-field-id',
  fieldName: 'Status',
  fieldType: 'status',
  value: { statusId: 'status-1', groupName: 'To Do', label: 'To Do' },
  displayValue: 'To Do',
};

export const mockAvailableStatuses: StatusFieldValue[] = [
  {
    displayValue: 'To Do',
    sequence: 1,
    statusGroupId: 'status-1',
  },
  {
    displayValue: 'In Progress',
    sequence: 2,
    statusGroupId: 'status-2',
  },
  {
    displayValue: 'Done',
    sequence: 3,
    statusGroupId: 'status-3',
  },
];
