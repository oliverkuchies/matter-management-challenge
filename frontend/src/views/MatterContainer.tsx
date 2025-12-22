import { MatterTableWrapper, SearchBar } from '../components';
import { useMatterStore } from '../store/useMatterStore';

export function MatterContainer() {
  const { handleSearchChange } = useMatterStore();
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

          <div className="mb-6">
            <SearchBar
              onChange={handleSearchChange}
              placeholder="Search across all fields including cycle times and SLA..."
            />
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <MatterTableWrapper />
          </div>
        </div>
      </div>
    </div>
  );
}
