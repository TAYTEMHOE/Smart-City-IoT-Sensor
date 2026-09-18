import type { SensorType } from '../../common/constants/sensor-types.constant.js';

export interface Threshold {
  min?: number;
  max?: number;
}

/** Per-sensor-type alert bounds. See root README "Alert thresholds" for rationale. */
export const THRESHOLDS: Record<SensorType, Threshold> = {
  temperature: { min: -10, max: 40 },
  humidity: { min: 10, max: 90 },
  air_quality: { max: 150 },
};
