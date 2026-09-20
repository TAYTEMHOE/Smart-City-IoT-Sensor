import type { ReactNode } from 'react';

interface MetricsCardsProps {
  activeSensors: number;
  totalReadings: number;
  alertsCount24h: number;
  /** null while the underlying totals haven't loaded yet. */
  healthPercent: number | null;
}

type Accent = 'blue' | 'amber' | 'emerald';

const ACCENT_CLASSES: Record<Accent, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
};

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  accent: Accent;
  /** Optional decoration on the right edge of the card (e.g. the health gauge). */
  aside?: ReactNode;
}

function MetricCard({ icon, label, value, accent, aside }: MetricCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${ACCENT_CLASSES[accent]}`}
        >
          <span className={icon} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
        </div>
      </div>
      {aside}
    </div>
  );
}

/** Semi-circle gauge needle, angled from the real healthPercent (180deg = 0%, 0deg = 100%). */
function HealthGauge({ percent }: { percent: number | null }) {
  const clamped = Math.max(0, Math.min(100, percent ?? 0));
  const angleRad = ((180 - clamped * 1.8) * Math.PI) / 180;
  const needleX = 50 + 34 * Math.cos(angleRad);
  const needleY = 45 - 34 * Math.sin(angleRad);
  // Semi-circle arc length for r=45 is pi*r; scale the colored portion to `clamped`%.
  const arcLength = Math.PI * 45;
  const filled = (clamped / 100) * arcLength;

  return (
    <svg viewBox="0 0 100 50" className="h-8 w-14 shrink-0" aria-hidden="true">
      <path d="M 5 45 A 45 45 0 0 1 95 45" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-emerald-100 dark:text-emerald-950/40" />
      <path
        d="M 5 45 A 45 45 0 0 1 95 45"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${arcLength}`}
        className="text-emerald-500"
      />
      <line x1="50" y1="45" x2={needleX} y2={needleY} stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-emerald-700 dark:text-emerald-400" />
      <circle cx="50" cy="45" r="3.5" fill="currentColor" className="text-emerald-700 dark:text-emerald-400" />
    </svg>
  );
}

export function MetricsCards({ activeSensors, totalReadings, alertsCount24h, healthPercent }: MetricsCardsProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="i-lucide-layout-dashboard text-blue-500" />
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">System Summary (KPIs)</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon="i-lucide-radio" label="Active Sensors" value={activeSensors.toString()} accent="emerald" />
        <MetricCard
          icon="i-lucide-database"
          label="Total Readings Ingested"
          value={totalReadings.toLocaleString()}
          accent="blue"
        />
        <MetricCard
          icon="i-lucide-triangle-alert"
          label="Recent Alerts (24h)"
          value={alertsCount24h.toString()}
          accent="amber"
        />
        <MetricCard
          icon="i-lucide-shield-check"
          label="System Health"
          value={healthPercent === null ? '—' : `${healthPercent.toFixed(1)}%`}
          accent="emerald"
          aside={<HealthGauge percent={healthPercent} />}
        />
      </div>
    </section>
  );
}
