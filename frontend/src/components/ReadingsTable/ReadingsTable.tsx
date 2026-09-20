import type { Reading, SensorType } from '../../types/reading.types.js';
import { formatDate } from '../../utils/formatDate.js';

interface ReadingsTableProps {
  readings: Reading[];
}

const SENSOR_TYPE_BADGE: Record<SensorType, string> = {
  temperature: 'i-lucide-thermometer bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
  humidity: 'i-lucide-droplet bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  air_quality: 'i-lucide-wind bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
};

function SensorTypeBadge({ sensorType }: { sensorType: SensorType }) {
  const classes = SENSOR_TYPE_BADGE[sensorType];
  const [icon, ...colors] = classes.split(' ');
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.join(' ')}`}
    >
      <span className={icon} />
      {sensorType}
    </span>
  );
}

export function ReadingsTable({ readings }: ReadingsTableProps) {
  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <span className="i-lucide-inbox text-3xl text-gray-300 dark:text-gray-700" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No readings match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-gray-800 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Sensor
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Type
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Value
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
            {readings.map((reading) => (
              <tr
                key={reading._id}
                className={
                  reading.isAlert
                    ? 'border-l-4 border-l-red-500 bg-red-50/60 transition-colors hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30'
                    : 'transition-colors hover:bg-slate-50/70 dark:hover:bg-gray-800/40'
                }
              >
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{reading.sensorId}</td>
                <td className="px-4 py-3">
                  <SensorTypeBadge sensorType={reading.sensorType} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      reading.isAlert
                        ? 'font-semibold text-red-700 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }
                  >
                    {reading.value}
                    {reading.unit}
                  </span>
                  {reading.isAlert && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900/40 dark:text-red-400">
                      <span className="i-lucide-triangle-alert text-xs" />
                      Alert
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(reading.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
