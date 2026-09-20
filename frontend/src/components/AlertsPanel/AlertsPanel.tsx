import { useMemo, useState } from 'react';
import type { Alert, AlertDirection } from '../../types/reading.types.js';
import { formatDate } from '../../utils/formatDate.js';

interface AlertsPanelProps {
  alerts: Alert[];
}

type SortOrder = 'desc' | 'asc';

const DIRECTION_STYLE: Record<AlertDirection, { badge: string; accent: string; card: string; icon: string }> = {
  above: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    accent: 'border-l-red-500',
    card: 'bg-red-50/40 dark:bg-red-950/10',
    icon: 'i-lucide-arrow-up',
  },
  below: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    accent: 'border-l-amber-500',
    card: 'bg-amber-50/40 dark:bg-amber-950/10',
    icon: 'i-lucide-arrow-down',
  },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedAlerts = useMemo(() => {
    const sorted = [...alerts].sort((a, b) => new Date(a.triggeredAt).getTime() - new Date(b.triggeredAt).getTime());
    return sortOrder === 'asc' ? sorted : sorted.reverse();
  }, [alerts, sortOrder]);

  return (
    <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          <span className="i-lucide-bell-ring text-red-500" />
          Recent Alerts
          {alerts.length > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
              {alerts.length}
            </span>
          )}
        </h2>

        {alerts.length > 1 && (
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            aria-label="Sort alerts"
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="i-lucide-circle-check text-3xl text-emerald-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No active alerts.</p>
        </div>
      ) : (
        <div role="list" className="flex list-none flex-col gap-2.5 overflow-y-auto p-0">
          {sortedAlerts.map((alert) => {
            const style = DIRECTION_STYLE[alert.direction];
            return (
              <div
                key={alert._id}
                role="listitem"
                className={`rounded-lg border border-l-4 border-gray-200 p-3 shadow-sm dark:border-gray-800 ${style.accent} ${style.card}`}
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
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
