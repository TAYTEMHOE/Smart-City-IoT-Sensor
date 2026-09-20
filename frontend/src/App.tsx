import { useMemo, useState } from 'react';
import type { ReadingsFilters } from './api/readings.api.js';
import { AlertsPanel } from './components/AlertsPanel/AlertsPanel.js';
import { ErrorCard } from './components/common/ErrorCard.js';
import { DashboardLayout, type ConnectionStatus } from './components/layout/DashboardLayout.js';
import { ReadingsChart } from './components/ReadingsChart/ReadingsChart.js';
import { ReadingsTable } from './components/ReadingsTable/ReadingsTable.js';
import { SensorFilterBar } from './components/SensorFilterBar/SensorFilterBar.js';
import { MetricsCards } from './components/SummaryMetrics/MetricsCards.js';
import { useAlerts } from './hooks/useAlerts.js';
import { READINGS_TABLE_LIMIT, useReadings } from './hooks/useReadings.js';

function App() {
  const [filters, setFilters] = useState<ReadingsFilters>({});
  const { data, error, isLoading, refetch } = useReadings(filters);

  // KPIs/health should reflect the operator's scope (sensorId/sensorType/time range)
  // but not the table-only "Only Alerts" display toggle.
  const kpiFilters = useMemo(
    () => ({ sensorId: filters.sensorId, sensorType: filters.sensorType, from: filters.from, to: filters.to }),
    [filters.sensorId, filters.sensorType, filters.from, filters.to],
  );
  // Cheap query (limit: 1) just to read meta.total for the alerting-reading count across
  // the full filtered dataset, independent of the table's own onlyAlerts toggle/page cap.
  const { data: alertingHealthData } = useReadings({ ...kpiFilters, onlyAlerts: true, limit: 1 });

  // Default the alerts panel to the last 24h unless the user picked an explicit "from".
  // Lazy useState initializer so the impure Date.now() read happens exactly once, on mount.
  const [last24Hours] = useState(() => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // /alerts only supports sensorId/from/to — sensorType and onlyAlerts don't apply.
  const alertsFilters = useMemo(
    () => ({ sensorId: filters.sensorId, from: filters.from ?? last24Hours, to: filters.to }),
    [filters.sensorId, filters.from, filters.to, last24Hours],
  );
  const { data: alertsData, error: alertsError, refetch: refetchAlerts } = useAlerts(alertsFilters);

  const connectionStatus: ConnectionStatus =
    error || alertsError ? 'disconnected' : isLoading && !data ? 'connecting' : 'connected';

  const activeSensors = useMemo(() => new Set((data?.data ?? []).map((r) => r.sensorId)).size, [data]);
  const totalReadings = data?.meta.total ?? 0;
  const alertingTotal = alertingHealthData?.meta.total ?? 0;
  const healthPercent = data
    ? totalReadings === 0
      ? 100
      : ((totalReadings - alertingTotal) / totalReadings) * 100
    : null;

  return (
    <DashboardLayout
      connectionStatus={connectionStatus}
      metrics={
        <MetricsCards
          activeSensors={activeSensors}
          totalReadings={totalReadings}
          alertsCount24h={alertsData?.data.length ?? 0}
          healthPercent={healthPercent}
        />
      }
      chart={<ReadingsChart readings={data?.data ?? []} forcedType={filters.sensorType} />}
      filterBar={<SensorFilterBar filters={filters} onChange={setFilters} />}
      table={
        <>
          {error ? (
            <ErrorCard message={`Failed to load readings: ${error.message}`} onRetry={refetch} />
          ) : isLoading && !data ? (
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900">
              <span className="i-lucide-refresh-cw animate-spin text-xl text-gray-400" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading readings…</span>
            </div>
          ) : (
            <>
              <ReadingsTable readings={data?.data ?? []} />
              {data && (
                <p className="mt-2 px-1 text-xs text-gray-400 dark:text-gray-500">
                  {data.data.length >= READINGS_TABLE_LIMIT
                    ? `Displaying latest ${READINGS_TABLE_LIMIT} records (filtered from ${data.meta.total.toLocaleString()} total)`
                    : `Displaying ${data.data.length} of ${data.meta.total.toLocaleString()} records`}
                </p>
              )}
            </>
          )}
        </>
      }
      alertsPanel={
        alertsError ? (
          <ErrorCard message={`Failed to load alerts: ${alertsError.message}`} onRetry={refetchAlerts} />
        ) : (
          <AlertsPanel alerts={alertsData?.data ?? []} />
        )
      }
    />
  );
}

export default App;
