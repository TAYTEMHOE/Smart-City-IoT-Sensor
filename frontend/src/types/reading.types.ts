export type SensorType = 'temperature' | 'humidity' | 'air_quality';

export interface Reading {
  _id: string;
  sensorId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  receivedAt: string;
  isAlert: boolean;
}
