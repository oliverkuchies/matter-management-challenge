import { MATTER_TABLE_COLUMNS } from './MatterTableWrapper';
import { SortIcon } from './SortIcon';

interface MatterHeadProps {
  sortBy: string;
  sortOrder: string;
  onSort: (column: string) => void;
}

export const MatterHead = ({ sortBy, sortOrder, onSort }: MatterHeadProps) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {MATTER_TABLE_COLUMNS.map((column) => (
          <th
            key={column.sortKey}
            onClick={() => onSort(column.sortKey)}
            className={`px-6 py-3 text-${column.align} text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 text-nowrap`}
            style={{ minWidth: column.minWidth ?? 'auto' }}
          >
            <div className="flex items-center gap-1">
              {column.label}
              <SortIcon column={column.sortKey} sortBy={sortBy} sortOrder={sortOrder} />
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};
