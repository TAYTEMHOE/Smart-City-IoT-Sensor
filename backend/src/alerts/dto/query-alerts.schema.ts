import { z } from 'zod';

const booleanFromString = z.enum(['true', 'false']).transform((v) => v === 'true');

export const queryAlertsSchema = z.object({
  sensorId: z.string().min(1).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  acknowledged: booleanFromString.optional(),
});

export type QueryAlertsDto = z.infer<typeof queryAlertsSchema>;
