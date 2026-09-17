import { z } from 'zod';

export const mqttReadingPayloadSchema = z.object({
  sensorId: z.string().min(1),
  sensorType: z.enum(['temperature', 'humidity', 'air_quality']),
  value: z.number(),
  unit: z.string().min(1),
  timestamp: z.string().datetime(),
});

export type MqttReadingPayload = z.infer<typeof mqttReadingPayloadSchema>;
