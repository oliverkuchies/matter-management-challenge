import { useQuery } from '@tanstack/react-query';
import {
  MatterListResponse,
  SLAFilter,
  ResolutionTimeFilter,
  DueDateFilter,
} from '../types/matter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface UseMatterParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  sla: SLAFilter;
  resolutionTime: ResolutionTimeFilter;
  dueDate: DueDateFilter;
}

async function fetchMatters(params: UseMatterParams): Promise<MatterListResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    search: params.search,
    sla: params.sla,
    resolutionTime: params.resolutionTime,
    dueDate: params.dueDate,
  });

  const response = await fetch(`${API_URL}/matters?${queryParams}`);

  if (!response.ok) {
    // Don't expose HTTP status codes to users
    throw new Error('Failed to load matters. Please try again.');
  }

  return response.json();
}

export function useMatters(params: UseMatterParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['matters', params],
    queryFn: () => fetchMatters(params),
    refetchInterval: 30000,
  });

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
