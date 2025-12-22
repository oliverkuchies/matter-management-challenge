import { SLAFilter } from '../../types/matter';

interface SlaFilterProps {
  value: SLAFilter;
  onChange: (value: SLAFilter) => void;
}

export function SlaFilter({ value, onChange }: SlaFilterProps) {
  const options: SLAFilter[] = ['All', 'In Progress', 'Met', 'Breached'];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sla-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        SLA Status:
      </label>
      <select
        id="sla-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as SLAFilter)}
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
