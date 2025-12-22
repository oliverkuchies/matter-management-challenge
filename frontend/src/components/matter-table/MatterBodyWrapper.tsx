import { useMatterStore } from '../../store/useMatterStore';
import { useMatters } from '../../hooks/useMatters';
import { MatterBody } from './MatterBody';
import { MATTER_TABLE_COLUMNS } from './MatterTableWrapper';

export function MatterBodyWrapper() {
  const { page, limit, sortBy, sortOrder, search, slaFilter, resolutionTimeFilter, dueDateFilter } =
    useMatterStore();

  const { data, loading, error } = useMatters({
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    sla: slaFilter,
    resolutionTime: resolutionTimeFilter,
    dueDate: dueDateFilter,
  });

  if (loading) {
    return (
      <tbody className="bg-white">
        <tr>
          <td colSpan={MATTER_TABLE_COLUMNS.length} className="px-6 py-12">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (error) {
    return (
      <tbody className="bg-white">
        <tr>
          <td colSpan={MATTER_TABLE_COLUMNS.length} className="px-6 py-12">
            <div className="text-center text-red-700">Error: {error}</div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (data.length === 0) {
    return (
      <tbody className="bg-white">
        <tr>
          <td colSpan={MATTER_TABLE_COLUMNS.length} className="px-6 py-12">
            <div className="text-center text-gray-500">No matters found</div>
          </td>
        </tr>
      </tbody>
    );
  }

  return <MatterBody matters={data} />;
}
