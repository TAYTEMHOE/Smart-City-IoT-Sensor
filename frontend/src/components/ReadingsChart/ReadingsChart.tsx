import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Reading, SensorType } from '../../types/reading.types.js';
import { formatTime } from '../../utils/formatDate.js';

interface ReadingsChartProps {
  readings: Reading[];
  /** When the operator filters the table to one sensor type, the chart follows it. */
  forcedType?: SensorType;
}

interface SensorTypeMeta {
  label: string;
  icon: string;
  color: string;
  unit: string;
  threshold: { min?: number; max?: number };
}

// Mirrors backend/src/alerts/config/thresholds.config.ts — keep in sync if that changes.
const SENSOR_TYPE_META: Record<SensorType, SensorTypeMeta> = {
  temperature: {
    label: 'Temperature',
    icon: 'i-lucide-thermometer',
    color: '#f97316',
    unit: '°C',
    threshold: { min: -10, max: 40 },
  },
  humidity: {
    label: 'Humidity',
    icon: 'i-lucide-droplet',
    color: '#3b82f6',
    unit: '%',
    threshold: { min: 10, max: 90 },
  },
  air_quality: {
    label: 'Air Quality',
    icon: 'i-lucide-wind',
    color: '#14b8a6',
    unit: 'AQI',
    threshold: { max: 150 },
  },
};

const SENSOR_TYPES: SensorType[] = ['temperature', 'humidity', 'air_quality'];

export function ReadingsChart({ readings, forcedType }: ReadingsChartProps) {
  const [localType, setLocalType] = useState<SensorType>('temperature');
  const selectedType = forcedType ?? localType;
  const meta = SENSOR_TYPE_META[selectedType];

  const series = useMemo(
    () =>
      readings
        .filter((r) => r.sensorType === selectedType)
        .slice()
        .reverse() // readings arrive newest-first; the chart reads left-to-right chronologically
        .map((r) => ({ timestamp: r.timestamp, value: r.value })),
    [readings, selectedType],
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          <span className="i-lucide-line-chart text-blue-500" />
          Fleet Trends
        </h2>
        {forcedType ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
            <span className={meta.icon} />
            {meta.label}
            <span className="text-gray-400 dark:text-gray-500">(from filter)</span>
          </span>
        ) : (
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-800/50">
            {SENSOR_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLocalType(type)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                  selectedType === type
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-50'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span className={SENSOR_TYPE_META[type].icon} />
                {SENSOR_TYPE_META[type].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {series.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
          <span className="i-lucide-inbox text-3xl text-gray-300 dark:text-gray-700" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No {meta.label.toLowerCase()} readings in the current view.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="text-gray-100 dark:text-gray-800" stroke="currentColor" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                tick={{ fontSize: 11 }}
                className="text-gray-400"
                minTickGap={32}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-gray-400"
                width={48}
                domain={[
                  (dataMin: number) =>
                    meta.threshold.min !== undefined ? Math.min(dataMin, meta.threshold.min) : dataMin,
                  (dataMax: number) =>
                    meta.threshold.max !== undefined ? Math.max(dataMax, meta.threshold.max) : dataMax,
                ]}
              />
              <Tooltip
                labelFormatter={(label) => formatTime(label as string)}
                formatter={(value) => [`${value}${meta.unit}`, meta.label]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              {meta.threshold.max !== undefined && (
                <ReferenceLine
                  y={meta.threshold.max}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Max ${meta.threshold.max}${meta.unit}`,
                    position: 'insideTopRight',
                    fontSize: 10,
                    fill: '#ef4444',
                  }}
                />
              )}
              {meta.threshold.min !== undefined && (
                <ReferenceLine
                  y={meta.threshold.min}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: `Min ${meta.threshold.min}${meta.unit}`,
                    position: 'insideBottomRight',
                    fontSize: 10,
                    fill: '#f59e0b',
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={meta.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
