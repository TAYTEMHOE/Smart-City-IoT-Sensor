import type { Alert } from '../types/reading.types.js';
import { apiFetch } from './client.js';

export interface AlertsFilters {
  sensorId?: string;
  from?: string;
  to?: string;
  acknowledged?: boolean;
}

export interface AlertsResponse {
  data: Alert[];
}

export function getAlerts(filters: AlertsFilters = {}): Promise<AlertsResponse> {
  const params = new URLSearchParams();
  if (filters.sensorId) params.set('sensorId', filters.sensorId);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.acknowledged !== undefined) params.set('acknowledged', String(filters.acknowledged));

  const query = params.toString();
  return apiFetch<AlertsResponse>(`/alerts${query ? `?${query}` : ''}`);
}
