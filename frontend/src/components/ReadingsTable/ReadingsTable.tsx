import type { Reading } from '../../types/reading.types.js';
import { formatDate } from '../../utils/formatDate.js';

interface ReadingsTableProps {
  readings: Reading[];
}

export function ReadingsTable({ readings }: ReadingsTableProps) {
  if (readings.length === 0) {
    return <p className="p-6 text-center text-sm text-gray-500">No readings match the current filters.</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-500">
          <th className="px-3 py-2 font-medium">Sensor</th>
          <th className="px-3 py-2 font-medium">Type</th>
          <th className="px-3 py-2 font-medium">Value</th>
          <th className="px-3 py-2 font-medium">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {readings.map((reading) => (
          <tr
            key={reading._id}
            className={
              reading.isAlert
                ? 'border-b border-gray-100 bg-red-50 font-medium text-red-700'
                : 'border-b border-gray-100 text-gray-800'
            }
          >
            <td className="px-3 py-2">{reading.sensorId}</td>
            <td className="px-3 py-2">{reading.sensorType}</td>
            <td className="px-3 py-2">
              {reading.value}
              {reading.unit}
              {reading.isAlert && <span className="ml-2 text-xs uppercase">⚠ alert</span>}
            </td>
            <td className="px-3 py-2">{formatDate(reading.timestamp)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
