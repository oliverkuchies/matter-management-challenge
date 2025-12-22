import { MatterTableWrapper, SearchBar } from '../components';
import { SlaFilter } from '../components/sla-filter';
import { ResolutionTimeFilterComponent } from '../components/resolution-time-filter';
import { DueDateFilterComponent } from '../components/due-date-filter';
import { useMatterStore } from '../store/useMatterStore';

export function MatterContainer() {
  const {
    handleSearchChange,
    slaFilter,
    handleSlaFilterChange,
    resolutionTimeFilter,
    handleResolutionTimeFilterChange,
    dueDateFilter,
    handleDueDateFilterChange,
  } = useMatterStore();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Matter Management System</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage all legal matters with cycle time tracking and SLA monitoring
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <SearchBar onChange={handleSearchChange} placeholder="Search across all fields..." />
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <SlaFilter value={slaFilter} onChange={handleSlaFilterChange} />
              <ResolutionTimeFilterComponent
                value={resolutionTimeFilter}
                onChange={handleResolutionTimeFilterChange}
              />{' '}
              <DueDateFilterComponent
                value={dueDateFilter}
                onChange={handleDueDateFilterChange}
              />{' '}
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <MatterTableWrapper />
          </div>
        </div>
      </div>
    </div>
  );
}
