import type { Alert, AlertDirection } from '../../types/reading.types.js';
import { formatDate } from '../../utils/formatDate.js';

interface AlertsPanelProps {
  alerts: Alert[];
}

const DIRECTION_STYLE: Record<AlertDirection, { badge: string; accent: string; icon: string }> = {
  above: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    accent: 'border-l-red-500',
    icon: 'i-lucide-arrow-up',
  },
  below: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    accent: 'border-l-amber-500',
    icon: 'i-lucide-arrow-down',
  },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          <span className="i-lucide-bell-ring text-red-500" />
          Recent Alerts
        </h2>
        {alerts.length > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="i-lucide-circle-check text-3xl text-emerald-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No active alerts.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5 overflow-y-auto">
          {alerts.map((alert) => {
            const style = DIRECTION_STYLE[alert.direction];
            return (
              <li
                key={alert._id}
                className={`rounded-lg border border-l-4 border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 ${style.accent}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{alert.sensorId}</span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}
                  >
                    <span className={style.icon} />
                    {alert.direction}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-gray-50">{alert.value}</span> vs threshold{' '}
                  {alert.threshold}
                </p>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{formatDate(alert.triggeredAt)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
