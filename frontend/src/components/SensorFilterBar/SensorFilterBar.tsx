import type { ReadingsFilters } from '../../api/readings.api.js';
import type { SensorType } from '../../types/reading.types.js';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../utils/formatDate.js';

const SENSOR_TYPES: SensorType[] = ['temperature', 'humidity', 'air_quality'];

const inputClass =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-blue-950';
const labelClass = 'flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-gray-400';

interface SensorFilterBarProps {
  filters: ReadingsFilters;
  onChange: (filters: ReadingsFilters) => void;
}

export function SensorFilterBar({ filters, onChange }: SensorFilterBarProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <label className={labelClass}>
        Sensor ID
        <span className="relative">
          <span className="i-lucide-search pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.sensorId ?? ''}
            onChange={(e) => onChange({ ...filters, sensorId: e.target.value || undefined })}
            placeholder="e.g. temp-01"
            className={`${inputClass} w-44 pl-8`}
          />
        </span>
      </label>

      <label className={labelClass}>
        Sensor type
        <select
          value={filters.sensorType ?? ''}
          onChange={(e) =>
            onChange({ ...filters, sensorType: (e.target.value || undefined) as SensorType | undefined })
          }
          className={`${inputClass} w-40`}
        >
          <option value="">All</option>
          {SENSOR_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        From
        <input
          type="datetime-local"
          value={filters.from ? toDatetimeLocalValue(filters.from) : ''}
          onChange={(e) =>
            onChange({ ...filters, from: e.target.value ? fromDatetimeLocalValue(e.target.value) : undefined })
          }
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        To
        <input
          type="datetime-local"
          value={filters.to ? toDatetimeLocalValue(filters.to) : ''}
          onChange={(e) =>
            onChange({ ...filters, to: e.target.value ? fromDatetimeLocalValue(e.target.value) : undefined })
          }
          className={inputClass}
        />
      </label>

      <label className="flex cursor-pointer items-center gap-2.5 pb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Only Alerts</span>
        <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={filters.onlyAlerts ?? false}
            onChange={(e) => onChange({ ...filters, onlyAlerts: e.target.checked || undefined })}
          />
          <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-red-500 dark:bg-gray-700" />
          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </span>
      </label>

      <button
        type="button"
        onClick={() => onChange({})}
        disabled={!hasActiveFilters}
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <span className="i-lucide-x text-base" />
        Reset
      </button>
    </div>
  );
}
