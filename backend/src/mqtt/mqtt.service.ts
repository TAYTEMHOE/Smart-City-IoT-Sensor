import { EventEmitter } from 'node:events';
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { MqttClient } from 'mqtt';
import { MQTT_CLIENT } from './mqtt.tokens.js';

export type MqttMessageHandler = (topic: string, payload: Buffer) => void;

/**
 * Owns the MQTT connection lifecycle and exposes an event-emitter style API
 * (`onMessage`) instead of the raw client, so consumers don't need to know
 * about `mqtt` package internals.
 */
@Injectable()
export class MqttService extends EventEmitter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);

  constructor(@Inject(MQTT_CLIENT) private readonly client: MqttClient) {
    super();
  }

  onModuleInit(): void {
    // The client starts connecting as soon as it's constructed (in MqttModule's
    // factory), so it may already be connected by the time these listeners attach.
    if (this.client.connected) {
      this.logger.log('Connected to MQTT broker');
    }
    this.client.on('connect', () => this.logger.log('Connected to MQTT broker'));
    this.client.on('reconnect', () => this.logger.warn('Reconnecting to MQTT broker...'));
    this.client.on('close', () => this.logger.warn('MQTT connection closed'));
    this.client.on('error', (err) => this.logger.error(`MQTT client error: ${err.message || err}`));
    this.client.on('message', (topic, payload) => this.emit('message', topic, payload));
  }

  onModuleDestroy(): void {
    this.client.end(true);
  }

  subscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, (err) => (err ? reject(err) : resolve()));
    });
  }

  onMessage(handler: MqttMessageHandler): void {
    this.on('message', handler);
  }
}
