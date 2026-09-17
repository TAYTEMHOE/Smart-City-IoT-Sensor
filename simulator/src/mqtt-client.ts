import mqtt, { type MqttClient } from 'mqtt';

export function connect(brokerUrl: string): Promise<MqttClient> {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(brokerUrl);
    client.once('connect', () => resolve(client));
    client.once('error', (err) => reject(err));
  });
}

export function publish(client: MqttClient, topic: string, payload: unknown): void {
  client.publish(topic, JSON.stringify(payload));
}
