import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface UpdateStatusParams {
  matterId: string;
  fieldId: string;
  statusId: string;
}

async function updateMatterStatus({ matterId, fieldId, statusId }: UpdateStatusParams) {
  const response = await fetch(`${API_URL}/matters/${matterId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fieldId,
      fieldType: 'status',
      value: statusId
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to update status: ${response.statusText}`);
  }

  return response.json();
}

export function useUpdateMatterStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateMatterStatus,
    onSuccess: () => {
      // Invalidate and refetch matters query
      queryClient.invalidateQueries({ queryKey: ['matters'] });
    },
  });

  return {
    updateStatus: mutation.mutate,
    updateStatusAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}
