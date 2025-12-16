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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: StatusFieldValue[] = await response.json();
      setStatusFields(result);
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status field options');
      console.error('Error fetching status field options:', err);
    }
    finally {
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

