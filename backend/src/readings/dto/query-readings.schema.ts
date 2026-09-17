import { z } from 'zod';
import { SENSOR_TYPES } from '../../common/constants/sensor-types.constant.js';

const booleanFromString = z.enum(['true', 'false']).transform((v) => v === 'true');

export const queryReadingsSchema = z.object({
  sensorId: z.string().min(1).optional(),
  sensorType: z.enum(SENSOR_TYPES).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  onlyAlerts: booleanFromString.optional(),
  limit: z.coerce.number().int().positive().max(500).default(100),
  page: z.coerce.number().int().positive().default(1),
});

export type QueryReadingsDto = z.infer<typeof queryReadingsSchema>;
