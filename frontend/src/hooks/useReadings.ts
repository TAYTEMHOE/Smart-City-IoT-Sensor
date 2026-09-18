import { useCallback } from 'react';
import { getReadings, type ReadingsFilters, type ReadingsResponse } from '../api/readings.api.js';
import { usePolling, type PollingState } from './usePolling.js';

export const READINGS_POLL_INTERVAL_MS = 5000;

export function useReadings(filters: ReadingsFilters): PollingState<ReadingsResponse> {
  const fetcher = useCallback(() => getReadings(filters), [filters]);
  return usePolling(fetcher, READINGS_POLL_INTERVAL_MS, [filters]);
}
