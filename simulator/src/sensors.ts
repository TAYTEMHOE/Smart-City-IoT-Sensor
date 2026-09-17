export type SensorType = 'temperature' | 'humidity' | 'air_quality';

export interface SensorDefinition {
  sensorId: string;
  sensorType: SensorType;
  unit: string;
  generateValue: () => number;
}

function randomInRange(min: number, max: number, decimals = 1): number {
  const value = Math.random() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// Mostly generates "normal" values, with a spikeChance of landing outside the
// alert threshold bounds documented in the root README, so alerting has
// something to react to during a demo.
function withOccasionalSpike(
  normal: [number, number],
  lowSpike: [number, number] | null,
  highSpike: [number, number] | null,
  decimals = 1,
  spikeChance = 0.12,
): () => number {
  return () => {
    if (Math.random() < spikeChance) {
      const spikeSides = [lowSpike, highSpike].filter((r): r is [number, number] => r !== null);
      const [min, max] = spikeSides[Math.floor(Math.random() * spikeSides.length)];
      return randomInRange(min, max, decimals);
    }
    return randomInRange(normal[0], normal[1], decimals);
  };
}

export const sensors: SensorDefinition[] = [
  {
    sensorId: 'temp-01',
    sensorType: 'temperature',
    unit: '°C',
    generateValue: withOccasionalSpike([15, 30], [-20, -11], [41, 46]),
  },
  {
    sensorId: 'humidity-01',
    sensorType: 'humidity',
    unit: '%',
    generateValue: withOccasionalSpike([30, 70], [0, 9], [91, 100]),
  },
  {
    sensorId: 'air-01',
    sensorType: 'air_quality',
    unit: 'AQI',
    generateValue: withOccasionalSpike([20, 100], null, [151, 220], 0),
  },
];
