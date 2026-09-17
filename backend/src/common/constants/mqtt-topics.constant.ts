export const MQTT_TOPICS = {
  READING_WILDCARD: 'smartcity/sensors/+/reading',
  reading: (sensorId: string) => `smartcity/sensors/${sensorId}/reading`,
} as const;
