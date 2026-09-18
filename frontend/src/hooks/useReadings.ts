import { useCallback } from 'react';
import { getReadings, type ReadingsFilters, type ReadingsResponse } from '../api/readings.api.js';
import { POLL_INTERVAL_MS, usePolling, type PollingState } from './usePolling.js';

export function useReadings(filters: ReadingsFilters): PollingState<ReadingsResponse> {
  const fetcher = useCallback(() => getReadings(filters), [filters]);
  return usePolling(fetcher, POLL_INTERVAL_MS, [filters]);
}
