import { z } from 'zod';
import { SENSOR_TYPES } from '../../common/constants/sensor-types.constant.js';

export const mqttReadingPayloadSchema = z.object({
  sensorId: z.string().min(1),
  sensorType: z.enum(SENSOR_TYPES),
  value: z.number(),
  unit: z.string().min(1),
  timestamp: z.string().datetime(),
});

export type MqttReadingPayload = z.infer<typeof mqttReadingPayloadSchema>;
