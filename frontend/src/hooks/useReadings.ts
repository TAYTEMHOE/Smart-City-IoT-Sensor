import { useCallback, useMemo } from 'react';
import { getReadings, type ReadingsFilters, type ReadingsResponse } from '../api/readings.api.js';
import { POLL_INTERVAL_MS, usePolling, type PollingState } from './usePolling.js';

/** Default table page size — latest N records, newest first (backend sorts by timestamp desc). */
export const READINGS_TABLE_LIMIT = 100;

export function useReadings(filters: ReadingsFilters): PollingState<ReadingsResponse> {
  const mergedFilters = useMemo(() => ({ limit: READINGS_TABLE_LIMIT, ...filters }), [filters]);
  const fetcher = useCallback(() => getReadings(mergedFilters), [mergedFilters]);
  return usePolling(fetcher, POLL_INTERVAL_MS, [mergedFilters]);
}
