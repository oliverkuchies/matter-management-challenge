import { useStatusFieldOptions } from '../../hooks/useStatusFieldOptions';
import { useUpdateMatterStatus } from '../../hooks/useUpdateMatterStatus';
import { Matter, CurrencyValue } from '../../types/matter';
import { formatCurrency, formatDate, formatBoolean } from '../../utils/formatting';
import { StatusCell } from '../status-cell/StatusCell';

interface MatterTableProps {
  matters: Matter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Met':
      return 'bg-green-100 text-green-800';
    case 'Breached':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function MatterTable({ matters, sortBy, sortOrder, onSort }: MatterTableProps) {
  const { statusFields } = useStatusFieldOptions();
  const { updateStatusAsync, isUpdating } = useUpdateMatterStatus();

  const handleStatusUpdate = async (matterId: string, fieldId: string, statusId: string) => {
    await updateStatusAsync({
      matterId,
      fieldId,
      statusId,
    });
  };

  // Define columns configuration
  const columns = [
    { label: 'Subject', fieldName: 'subject', sortKey: 'subject', align: 'left' },
    { label: 'Case Number', fieldName: 'case number', sortKey: 'case number', align: 'left' },
    { label: 'Status', fieldName: 'status', sortKey: 'status', align: 'left' },
    { label: 'Assigned To', fieldName: 'assigned to', sortKey: 'assigned to', align: 'left' },
    { label: 'Priority', fieldName: 'priority', sortKey: 'priority', align: 'left' },
    {
      label: 'Contract Value',
      fieldName: 'contract value',
      sortKey: 'contract value',
      align: 'left',
    },
    { label: 'Due Date', fieldName: 'due date', sortKey: 'due date', align: 'left' },
    { label: 'Urgent', fieldName: 'urgent', sortKey: 'urgent', align: 'center' },
    {
      label: 'Resolution Time',
      fieldName: 'resolution-time',
      sortKey: 'resolution_time',
      align: 'left',
      isComputed: true,
    },
    { label: 'SLA', fieldName: 'sla', sortKey: 'sla', align: 'left', isComputed: true },
  ];

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  /**
   * Renders the value of a field for a given matter
   * @param matter - The Matter object
   * @param fieldName - The name of the field to render
   * @param isComputed - Whether the field is a computed field (e.g., resolution time, SLA)
   * @returns A JSX element representing the field value
   */
  const renderFieldValue = (matter: Matter, fieldName: string, isComputed = false) => {
    if (isComputed) {
      if (fieldName === 'resolution-time') {
        return (
          <span className="text-sm text-gray-600">
            {matter.cycleTime?.resolutionTimeFormatted || 'N/A'}
          </span>
        );
      }
      if (fieldName === 'sla') {
        return (
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all duration-200 ${getStatusBadgeColor(matter.sla)}`}
          >
            {matter.sla}
          </span>
        );
      }
    }

    const field = matter.fields[fieldName];
    if (!field) return <span className="text-gray-400">N/A</span>;

    switch (field.fieldType) {
      case 'currency':
        return (
          <span className="font-medium">{formatCurrency(field.value as CurrencyValue | null)}</span>
        );

      case 'date':
        return <span>{formatDate(field.value as string | null)}</span>;

      case 'boolean':
        return (
          <span className={field.value ? 'text-green-600' : 'text-gray-400'}>
            {formatBoolean(field.value as boolean | null)}
          </span>
        );

      case 'status':
        return (
          <StatusCell
            matterId={matter.id}
            currentStatus={field}
            availableStatuses={statusFields}
            onUpdate={handleStatusUpdate}
            isUpdating={isUpdating}
          />
        );

      case 'resolution-time':
        return <span>{matter.cycleTime?.resolutionTimeFormatted || 'N/A'}</span>;

      case 'user':
        return <span>{field.displayValue}</span>;

      default:
        return <span>{field.displayValue || String(field.value) || 'N/A'}</span>;
    }
  };

  if (matters.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No matters found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.sortKey}
                onClick={() => onSort(column.sortKey)}
                className={`px-6 py-3 text-${column.align} text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100`}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {renderSortIcon(column.sortKey)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {matters.map((matter) => (
            <tr key={matter.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={`${matter.id}-${column.sortKey}`}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${column.align === 'center' ? 'text-center' : 'text-gray-500'}`}
                >
                  {column.fieldName === 'subject' ? (
                    <div className="font-medium text-gray-900">
                      {renderFieldValue(matter, column.fieldName, column.isComputed)}
                    </div>
                  ) : (
                    renderFieldValue(matter, column.fieldName, column.isComputed)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
