import type { Alert } from '../../types/reading.types.js';
import { formatDate } from '../../utils/formatDate.js';

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <section className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-700">
        Alerts {alerts.length > 0 && `(${alerts.length})`}
      </h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-red-700/70">No active alerts.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <li
              key={alert._id}
              className="flex items-center justify-between gap-4 rounded-md border border-red-200 bg-white px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-red-700">{alert.sensorId}</span>
                <span className="ml-2 text-gray-600">
                  {alert.value} — {alert.direction} threshold {alert.threshold}
                </span>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{formatDate(alert.triggeredAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
