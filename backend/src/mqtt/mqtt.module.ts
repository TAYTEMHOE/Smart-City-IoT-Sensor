import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mqtt from 'mqtt';
import { MqttService } from './mqtt.service.js';
import { MQTT_CLIENT } from './mqtt.tokens.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MQTT_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        mqtt.connect(config.getOrThrow<string>('mqttBrokerUrl'), {
          reconnectPeriod: 2000,
        }),
    },
    MqttService,
  ],
  exports: [MqttService],
})
export class MqttModule {}
