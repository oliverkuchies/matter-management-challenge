import { create } from 'zustand';
import { Matter, SLAFilter, ResolutionTimeFilter, DueDateFilter } from '../types/matter';

interface MatterState {
  // State
  selectedMatter: Matter | null;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  slaFilter: SLAFilter;
  resolutionTimeFilter: ResolutionTimeFilter;
  dueDateFilter: DueDateFilter;
  // Actions
  setSelectedMatter: (matter: Matter | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setSearch: (search: string) => void;
  setSlaFilter: (slaFilter: SLAFilter) => void;
  setResolutionTimeFilter: (resolutionTimeFilter: ResolutionTimeFilter) => void;
  setDueDateFilter: (dueDateFilter: DueDateFilter) => void;
  handleSearchChange: (value: string) => void;
  handleSlaFilterChange: (value: SLAFilter) => void;
  handleResolutionTimeFilterChange: (value: ResolutionTimeFilter) => void;
  handleDueDateFilterChange: (value: DueDateFilter) => void;
  handleSort: (column: string) => void;
  handleLimitChange: (newLimit: number) => void;
}

export const useMatterStore = create<MatterState>((set, get) => ({
  // Initial state
  selectedMatter: null,
  page: 1,
  limit: 25,
  sortBy: 'created_at',
  sortOrder: 'desc',
  search: '',
  slaFilter: 'All',
  resolutionTimeFilter: 'All',
  dueDateFilter: 'All',

  // Actions
  setSelectedMatter: (matter) => set({ selectedMatter: matter }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setSearch: (search) => set({ search }),
  setSlaFilter: (slaFilter) => set({ slaFilter }),
  setResolutionTimeFilter: (resolutionTimeFilter) => set({ resolutionTimeFilter }),
  setDueDateFilter: (dueDateFilter) => set({ dueDateFilter }),
  handleSearchChange: (value) => set({ search: value, page: 1 }),
  handleSlaFilterChange: (value) => set({ slaFilter: value, page: 1 }),
  handleResolutionTimeFilterChange: (value) => set({ resolutionTimeFilter: value, page: 1 }),
  handleDueDateFilterChange: (value) => set({ dueDateFilter: value, page: 1 }),
  handleSort: (column) => {
    const { sortBy, sortOrder } = get();
    if (sortBy === column) {
      set({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortBy: column, sortOrder: 'asc' });
    }
  },

  handleLimitChange: (newLimit) => set({ limit: newLimit, page: 1 }),
}));
