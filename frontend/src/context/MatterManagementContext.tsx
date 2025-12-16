import { createContext, useContext, useState, ReactNode } from 'react';
import { Matter } from '../types/matter';
import { useMatters } from '../hooks/useMatters';

interface MatterManagementContextType {
  updateStatus: (matterId: string, fieldId: string, statusId: string) => Promise<void>;
  selectedMatter: Matter | null;
  setSelectedMatter: (matter: Matter | null) => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  search: string;
  data: Matter[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  handleSort: (column: string) => void;
  handleLimitChange: (newLimit: number) => void;
}

export const MatterManagementContext = createContext<MatterManagementContextType | undefined>(
  undefined
);

export function MatterManagementProvider({ children }: { children: ReactNode }) {
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search] = useState(''); // TODO: Implement search state management

  const { data, total, totalPages, loading, error } = useMatters({
    page,
    limit,
    sortBy,
    sortOrder,
    search,
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const exposedContextValue = {
    selectedMatter,
    setSelectedMatter,
    page,
    setPage,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    search,
    data,
    total,
    totalPages,
    loading,
    error,
    handleSort,
    handleLimitChange,
  };

  return (
    <MatterManagementContext.Provider value={exposedContextValue}>
      {children}
    </MatterManagementContext.Provider>
  );
}

export function useMatterManagement() {
  const context = useContext(MatterManagementContext);
  if (!context) {
    throw new Error('useMatterManagement must be used within MatterManagementProvider');
  }
  return context;
}
