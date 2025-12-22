import { useState, useEffect, useCallback } from 'react';
import { StatusFieldValue } from '../types/matter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export function useStatusFieldOptions() {
  const [statusFields, setStatusFields] = useState<StatusFieldValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchStatusFieldOptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/status/options`);
      if (!response.ok) {
        // Don't expose HTTP status to users
        throw new Error('Failed to load status options');
      }

      const result: StatusFieldValue[] = await response.json();
      setStatusFields(result);
    } catch (err) {
      // Don't leak error details to UI
      setError('Failed to load status options. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatusFieldOptions();
  }, [fetchStatusFieldOptions]);

  return {
    statusFields,
    loading,
    error,
  };
}
