import { useCallback } from 'react';
import { getAlerts, type AlertsFilters, type AlertsResponse } from '../api/alerts.api.js';
import { POLL_INTERVAL_MS, usePolling, type PollingState } from './usePolling.js';

export function useAlerts(filters: AlertsFilters): PollingState<AlertsResponse> {
  const fetcher = useCallback(() => getAlerts(filters), [filters]);
  return usePolling(fetcher, POLL_INTERVAL_MS, [filters]);
}
