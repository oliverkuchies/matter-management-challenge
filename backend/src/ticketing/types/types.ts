export interface Matter {
  id: string;
  boardId: string;
  fields: Record<string, FieldValue>;
  cycleTime?: CycleTime;
  sla: SLAStatus;
  createdAt: string;
  updatedAt: string;
}

export type FieldValueType = string | number | boolean | Date | CurrencyValue | UserValue | StatusValue | null;

export interface FieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: FieldType;
  value: FieldValueType;
  displayValue: string | null;
}

export interface StatusFieldValue extends Partial<FieldValue> {
  sequence: number;
  statusGroupId: string;
}

export interface CurrencyValue {
  amount: number;
  currency: string;
}

export interface UserValue {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
}

export interface StatusValue {
  statusId: string;
  groupName: string;
}

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'currency' | 'boolean' | 'status' | 'user';

export interface CycleTime {
  resolutionTimeMs: number;
  resolutionTimeFormatted: string;
  isInProgress: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export type SLAStatus = 'In Progress' | 'Met' | 'Breached';

export type SLAFilter = 'All' | SLAStatus;

export type ResolutionTimeFilter = 
  | 'All' 
  | 'Under 1 hour' 
  | '1-4 hours' 
  | '4-8 hours' 
  | 'Over 8 hours';

export type DueDateFilter = 
  | 'All' 
  | 'Overdue' 
  | 'Due Today' 
  | 'Due This Week' 
  | 'Due This Month' 
  | 'No Due Date';

export interface MatterListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  sla?: SLAFilter;
  resolutionTime?: ResolutionTimeFilter;
  dueDate?: DueDateFilter;
}

export interface MatterListResponse {
  data: Matter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Field {
  id: string;
  accountId: number;
  name: string;
  fieldType: FieldType;
  description: string | null;
  metadata: Record<string, unknown> | null;
  systemField: boolean;
  options?: FieldOption[];
  statusOptions?: StatusOption[];
}

export interface FieldOption {
  id: string;
  label: string;
  sequence: number;
}

export interface StatusOption {
  id: string;
  label: string;
  groupId: string;
  groupName: string;
  sequence: number;
}

export interface StatusGroup {
  id: string;
  name: string;
  sequence: number;
}

export interface CycleTimeHistory {
  id: string;
  ticketId: string;
  statusFieldId: string;
  fromStatusId: string | null;
  toStatusId: string;
  transitionedAt: Date;
}

