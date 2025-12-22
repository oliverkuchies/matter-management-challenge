import { useMatterStore } from '../../store/useMatterStore';
import { MatterHead } from './MatterHead';

export function MatterHeadWrapper() {
  const sortBy = useMatterStore((state) => state.sortBy);
  const sortOrder = useMatterStore((state) => state.sortOrder);
  const handleSort = useMatterStore((state) => state.handleSort);

  return <MatterHead sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />;
}
