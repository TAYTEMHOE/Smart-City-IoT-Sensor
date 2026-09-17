import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { MQTT_TOPICS } from '../common/constants/mqtt-topics.constant.js';
import { MqttService } from '../mqtt/mqtt.service.js';
import { mqttReadingPayloadSchema } from '../readings/dto/mqtt-reading-payload.schema.js';

/**
 * Orchestrates the ingestion pipeline: validate -> persist -> evaluate.
 * Contains no persistence/alerting logic itself — that's delegated to
 * ReadingsService/AlertsService once those exist (F4/F6).
 */
@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly mqttService: MqttService) {}

  async onModuleInit(): Promise<void> {
    await this.mqttService.subscribe(MQTT_TOPICS.READING_WILDCARD);
    this.mqttService.onMessage((topic, payload) => this.handleMessage(topic, payload));
    this.logger.log(`Subscribed to ${MQTT_TOPICS.READING_WILDCARD}`);
  }

  private handleMessage(topic: string, payload: Buffer): void {
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

    // F4 will persist this via ReadingsService; ingestion ends here for now.
    const reading = result.data;
    this.logger.log(`Validated reading ${reading.sensorId}=${reading.value}${reading.unit}`);
  }
}
