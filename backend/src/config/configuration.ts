export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI,
  mqttBrokerUrl: process.env.MQTT_BROKER_URL,
});
