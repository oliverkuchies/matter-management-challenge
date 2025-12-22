import { useStatusFieldOptions } from '../../hooks/useStatusFieldOptions';
import { useUpdateMatterStatus } from '../../hooks/useUpdateMatterStatus';
import { Matter, CurrencyValue, StatusFieldValue } from '../../types/matter';
import { formatCurrency, formatDate, formatBoolean } from '../../utils/formatting';
import { StatusCell } from '../status-cell';
import { getStatusBadgeColor, MATTER_TABLE_COLUMNS } from './MatterTableWrapper';

interface Column {
  label: string;
  fieldName: string;
  sortKey: string;
  align: string;
  isComputed?: boolean;
}

const renderFieldValue = (
  matter: Matter,
  column: Column,
  statusFields: StatusFieldValue[],
  handleStatusUpdate: (matterId: string, fieldId: string, statusId: string) => Promise<void>,
  isUpdating: boolean,
) => {
  if (column.isComputed) {
    if (column.fieldName === 'resolution-time') {
      return matter.cycleTime?.resolutionTimeFormatted || 'N/A';
    }
    if (column.fieldName === 'sla') {
      const sla = matter.sla;
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(sla || '')}`}
        >
          {sla || 'N/A'}
        </span>
      );
    }
  }

  const field = matter.fields[column.fieldName];

  if (!field) {
    return 'N/A';
  }

  if (field.fieldType === 'status') {
    return (
      <StatusCell
        matterId={matter.id}
        currentStatus={field}
        availableStatuses={statusFields}
        onUpdate={handleStatusUpdate}
        isUpdating={isUpdating}
      />
    );
  }

  if (field.fieldType === 'currency') {
    const currencyValue = field.value as CurrencyValue;
    return formatCurrency(currencyValue);
  }

  if (field.fieldType === 'date') {
    return formatDate(field.value as string);
  }

  if (field.fieldType === 'boolean') {
    return formatBoolean(field.value as boolean);
  }

  return (
    <div className="truncate max-w-[15rem]" title={String(field.value)}>
      {field.displayValue || String(field.value)}
    </div>
  );
};

interface MatterBodyProps {
  matters: Matter[];
}

export const MatterBody = (matterBodyProps: MatterBodyProps) => {
  const { matters } = matterBodyProps;
  const { statusFields } = useStatusFieldOptions();
  const { updateStatusAsync, isUpdating } = useUpdateMatterStatus();

  const handleStatusUpdate = async (matterId: string, fieldId: string, statusId: string) => {
    await updateStatusAsync({
      matterId,
      fieldId,
      statusId,
    });
  };

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {matters.map((matter) => (
        <tr key={matter.id} className="hover:bg-gray-50">
          {MATTER_TABLE_COLUMNS.map((column) => (
            <td
              key={`${matter.id}-${column.sortKey}`}
              className={`px-6 py-4 whitespace-nowrap text-sm ${column.align === 'center' ? 'text-center' : 'text-gray-500'}`}
            >
              {column.fieldName === 'subject' ? (
                <div
                  className="font-medium text-gray-900 truncate"
                  title={String(matter.fields[column.fieldName]?.value || '')}
                >
                  {renderFieldValue(matter, column, statusFields, handleStatusUpdate, isUpdating)}
                </div>
              ) : (
                renderFieldValue(matter, column, statusFields, handleStatusUpdate, isUpdating)
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
