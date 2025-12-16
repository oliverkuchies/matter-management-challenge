import { useState, useRef } from 'react';
import { FieldValue, StatusValue } from '../../types/matter';
import { useCloseOutsideClicks } from './hooks/useCloseOutsideClicks';
import { getStatusColor } from './utils';
import { StatusFieldValue } from '../../types/matter';

interface StatusCellProps {
  matterId: string;
  currentStatus: FieldValue;
  availableStatuses: StatusFieldValue[];
  onUpdate: (matterId: string, fieldId: string, statusId: string) => Promise<void>;
  isUpdating?: boolean;
}

export function StatusCell({
  matterId,
  currentStatus,
  availableStatuses,
  onUpdate,
  isUpdating = false,
}: StatusCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useCloseOutsideClicks({
    dropdownRef,
    isOpen,
    setIsOpen,
  });

  const handleStatusChange = async (newStatusId: string) => {
    const currentStatusValue = currentStatus.value as StatusValue | null;

    if (!newStatusId) {
      throw new Error('Invalid status ID');
    }

    if (!currentStatusValue) {
      throw new Error('Current status value is invalid');
    }

    const currentStatusId = currentStatusValue.statusId;
    if (newStatusId === currentStatusId) {
      setIsOpen(false);
      return;
    }

    try {
      await onUpdate(matterId, currentStatus.fieldId, newStatusId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <>
      {availableStatuses.length === 0 ? (
        <>No Statuses Available</>
      ) : (
        <div
          className="relative"
          ref={dropdownRef}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Status Dropdown"
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isUpdating}
            aria-label="Current Status"
            className={`
          px-3 py-1 rounded-full text-xs font-medium border
          transition-all duration-200 flex items-center gap-2
          ${getStatusColor(currentStatus.displayValue ?? '')}
          ${isUpdating ? 'opacity-50 cursor-wait' : 'hover:shadow-md cursor-pointer'}
        `}
          >
            {currentStatus.displayValue}
          </button>
          {isOpen && (
            <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 flex flex-col">
              {availableStatuses.map((status, index) => (
                <button
                  key={`${status.displayValue}-${index}`}
                  onClick={() => handleStatusChange(status.statusGroupId)}
                  disabled={isUpdating}
                  className={`
                w-full text-left px-4 py-2 text-sm
                transition-colors duration-150
                ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                ${
                  status.displayValue === currentStatus.displayValue
                    ? 'bg-gray-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs mr-2 ${getStatusColor(status.displayValue ?? '')}`}
                  >
                    {status.displayValue}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
