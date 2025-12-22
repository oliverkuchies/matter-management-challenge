import { DueDateFilter } from '../../types/matter';

interface DueDateFilterProps {
  value: DueDateFilter;
  onChange: (value: DueDateFilter) => void;
}

export function DueDateFilterComponent({ value, onChange }: DueDateFilterProps) {
  const options: DueDateFilter[] = [
    'All',
    'Overdue',
    'Due Today',
    'Due This Week',
    'Due This Month',
    'No Due Date',
  ];

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="due-date-filter"
        className="text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        Due Date:
      </label>
      <select
        id="due-date-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as DueDateFilter)}
        className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
