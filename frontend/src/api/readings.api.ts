import type { Reading, SensorType } from '../types/reading.types.js';
import { apiFetch } from './client.js';

export interface ReadingsFilters {
  sensorId?: string;
  sensorType?: SensorType;
  from?: string;
  to?: string;
  onlyAlerts?: boolean;
  limit?: number;
  page?: number;
}

export interface ReadingsResponse {
  data: Reading[];
  meta: { total: number; page: number; limit: number };
}

export function getReadings(filters: ReadingsFilters = {}): Promise<ReadingsResponse> {
  const params = new URLSearchParams();
  if (filters.sensorId) params.set('sensorId', filters.sensorId);
  if (filters.sensorType) params.set('sensorType', filters.sensorType);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.onlyAlerts) params.set('onlyAlerts', 'true');
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.page) params.set('page', String(filters.page));

  const query = params.toString();
  return apiFetch<ReadingsResponse>(`/readings${query ? `?${query}` : ''}`);
}
