import type { ReactNode } from 'react';
import { POLL_INTERVAL_MS } from '../../hooks/usePolling.js';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; dot: string; pill: string }> = {
  connecting: {
    label: 'Connecting…',
    dot: 'bg-amber-400',
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
  connected: {
    label: 'Connected',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  disconnected: {
    label: 'Disconnected',
    dot: 'bg-red-500',
    pill: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
};

interface DashboardLayoutProps {
  connectionStatus: ConnectionStatus;
  filterBar: ReactNode;
  table: ReactNode;
  alertsPanel: ReactNode;
}

export function DashboardLayout({ connectionStatus, filterBar, table, alertsPanel }: DashboardLayoutProps) {
  const status = STATUS_CONFIG[connectionStatus];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="i-lucide-radio text-2xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Smart City IoT Dashboard</h1>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.pill}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <span className="i-lucide-refresh-cw text-sm" />
              Refresh: {POLL_INTERVAL_MS / 1000}s
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-6">
        {filterBar}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          <div className="lg:col-span-7">{table}</div>
          <div className="lg:col-span-3">{alertsPanel}</div>
        </div>
      </main>
    </div>
  );
}
