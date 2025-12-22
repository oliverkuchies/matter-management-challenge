import { Pagination } from '../pagination/Pagination';
import { useMatterStore } from '../../store/useMatterStore';
import { useMatters } from '../../hooks/useMatters';
import { MatterHeadWrapper } from './MatterHeadWrapper';
import { MatterBodyWrapper } from './MatterBodyWrapper';

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

export const MATTER_TABLE_COLUMNS = [
  { label: 'Subject', fieldName: 'subject', sortKey: 'subject', align: 'left', minWidth: '18rem' },
  { label: 'Case Number', fieldName: 'case number', sortKey: 'case number', align: 'left', minWidth: '10rem' },
  { label: 'Status', fieldName: 'status', sortKey: 'status', align: 'left', minWidth: '10rem' },
  { label: 'Assigned To', fieldName: 'assigned to', sortKey: 'assigned to', align: 'left', minWidth: '10rem' },
  { label: 'Priority', fieldName: 'priority', sortKey: 'priority', align: 'left', minWidth: '10rem' },
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


export function MatterTableWrapper() {
  const page = useMatterStore((state) => state.page);
  const limit = useMatterStore((state) => state.limit);
  const sortBy = useMatterStore((state) => state.sortBy);
  const sortOrder = useMatterStore((state) => state.sortOrder);
  const search = useMatterStore((state) => state.search);
  const setPage = useMatterStore((state) => state.setPage);
  const handleLimitChange = useMatterStore((state) => state.handleLimitChange);

  const { data, total, totalPages } = useMatters({
    page,
    limit,
    sortBy,
    sortOrder,
    search,
  });

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed min-h-screen">
          <MatterHeadWrapper />
          <MatterBodyWrapper />
        </table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          total={total}
        />
      )}
    </>
  );
}
