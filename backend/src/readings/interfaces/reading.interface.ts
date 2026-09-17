import type { MqttReadingPayload } from '../dto/mqtt-reading-payload.schema.js';

/** Input to ReadingsService.create() — a validated inbound MQTT payload. */
export type CreateReadingInput = MqttReadingPayload;
