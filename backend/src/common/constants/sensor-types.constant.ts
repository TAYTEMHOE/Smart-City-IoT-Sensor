export const SENSOR_TYPES = ['temperature', 'humidity', 'air_quality'] as const;

export type SensorType = (typeof SENSOR_TYPES)[number];
