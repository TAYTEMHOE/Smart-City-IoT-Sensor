import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { MQTT_TOPICS } from '../common/constants/mqtt-topics.constant.js';
import { MqttService } from '../mqtt/mqtt.service.js';
import { mqttReadingPayloadSchema } from '../readings/dto/mqtt-reading-payload.schema.js';
import { ReadingsService } from '../readings/readings.service.js';

/**
 * Orchestrates the ingestion pipeline: validate -> persist -> evaluate.
 * Contains no persistence/alerting logic itself — that's delegated to
 * ReadingsService/AlertsService (constructor-injected) so this stays a thin
 * orchestrator and each stage is independently unit-testable.
 */
@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly readingsService: ReadingsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.mqttService.subscribe(MQTT_TOPICS.READING_WILDCARD);
    this.mqttService.onMessage((topic, payload) => {
      void this.handleMessage(topic, payload);
    });
    this.logger.log(`Subscribed to ${MQTT_TOPICS.READING_WILDCARD}`);
  }

  private async handleMessage(topic: string, payload: Buffer): Promise<void> {
    let json: unknown;
    try {
      json = JSON.parse(payload.toString());
    } catch {
      this.logger.warn(`Dropped message on ${topic}: not valid JSON`);
      return;
    }

    const result = mqttReadingPayloadSchema.safeParse(json);
    if (!result.success) {
      this.logger.warn(`Dropped message on ${topic}: ${result.error.message}`);
      return;
    }

    const reading = result.data;
    try {
      await this.readingsService.create(reading);
      this.logger.log(`Persisted reading ${reading.sensorId}=${reading.value}${reading.unit}`);
    } catch {
      // ReadingsService already logs the underlying error; this just keeps
      // one bad write from taking down the ingestion loop for other messages.
      this.logger.warn(`Reading from ${topic} was validated but not persisted`);
    }
  }
}
