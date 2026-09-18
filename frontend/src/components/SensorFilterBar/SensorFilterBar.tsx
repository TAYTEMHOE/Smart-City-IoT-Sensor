import type { ReadingsFilters } from '../../api/readings.api.js';
import type { SensorType } from '../../types/reading.types.js';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../utils/formatDate.js';

const SENSOR_TYPES: SensorType[] = ['temperature', 'humidity', 'air_quality'];

interface SensorFilterBarProps {
  filters: ReadingsFilters;
  onChange: (filters: ReadingsFilters) => void;
}

export function SensorFilterBar({ filters, onChange }: SensorFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <label className="flex flex-col text-sm text-gray-600">
        Sensor ID
        <input
          type="text"
          value={filters.sensorId ?? ''}
          onChange={(e) => onChange({ ...filters, sensorId: e.target.value || undefined })}
          placeholder="e.g. temp-01"
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </label>

      <label className="flex flex-col text-sm text-gray-600">
        Sensor type
        <select
          value={filters.sensorType ?? ''}
          onChange={(e) =>
            onChange({ ...filters, sensorType: (e.target.value || undefined) as SensorType | undefined })
          }
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          {SENSOR_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-gray-600">
        From
        <input
          type="datetime-local"
          value={filters.from ? toDatetimeLocalValue(filters.from) : ''}
          onChange={(e) =>
            onChange({ ...filters, from: e.target.value ? fromDatetimeLocalValue(e.target.value) : undefined })
          }
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </label>

      <label className="flex flex-col text-sm text-gray-600">
        To
        <input
          type="datetime-local"
          value={filters.to ? toDatetimeLocalValue(filters.to) : ''}
          onChange={(e) =>
            onChange({ ...filters, to: e.target.value ? fromDatetimeLocalValue(e.target.value) : undefined })
          }
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </label>

      <button
        type="button"
        onClick={() => onChange({})}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  );
}
