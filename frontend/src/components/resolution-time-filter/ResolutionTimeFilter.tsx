import { ResolutionTimeFilter } from '../../types/matter';

interface ResolutionTimeFilterProps {
  value: ResolutionTimeFilter;
  onChange: (value: ResolutionTimeFilter) => void;
}

export function ResolutionTimeFilterComponent({ value, onChange }: ResolutionTimeFilterProps) {
  const options: ResolutionTimeFilter[] = [
    'All',
    'Under 1 hour',
    '1-4 hours',
    '4-8 hours',
    'Over 8 hours',
  ];

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="resolution-time-filter"
        className="text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        Resolution Time:
      </label>
      <select
        id="resolution-time-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as ResolutionTimeFilter)}
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
