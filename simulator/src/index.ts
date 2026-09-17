import 'dotenv/config';
import { connect, publish } from './mqtt-client.js';
import { sensors } from './sensors.js';

const brokerUrl = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
const publishIntervalMs = Number(process.env.PUBLISH_INTERVAL_MS ?? 3000);

async function main() {
  const client = await connect(brokerUrl);
  console.log(`[simulator] connected to ${brokerUrl}`);

  const timers = sensors.map((sensor) => {
    const publishReading = () => {
      const reading = {
        sensorId: sensor.sensorId,
        sensorType: sensor.sensorType,
        value: sensor.generateValue(),
        unit: sensor.unit,
        timestamp: new Date().toISOString(),
      };
      const topic = `smartcity/sensors/${sensor.sensorId}/reading`;
      publish(client, topic, reading);
      console.log(`[simulator] -> ${topic}`, reading);
    };

    publishReading();
    return setInterval(publishReading, publishIntervalMs);
  });

  const shutdown = () => {
    timers.forEach(clearInterval);
    client.end(true, {}, () => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[simulator] failed to start', err);
  process.exit(1);
});
