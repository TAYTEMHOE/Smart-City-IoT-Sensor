import { useState } from 'react';
import type { ReadingsFilters } from './api/readings.api.js';
import { DashboardLayout } from './components/layout/DashboardLayout.js';
import { ReadingsTable } from './components/ReadingsTable/ReadingsTable.js';
import { SensorFilterBar } from './components/SensorFilterBar/SensorFilterBar.js';
import { useReadings } from './hooks/useReadings.js';

function App() {
  const [filters, setFilters] = useState<ReadingsFilters>({});
  const { data, error, isLoading } = useReadings(filters);

  return (
    <DashboardLayout>
      <SensorFilterBar filters={filters} onChange={setFilters} />

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {error ? (
          <p className="p-6 text-center text-sm text-red-600">Failed to load readings: {error.message}</p>
        ) : isLoading && !data ? (
          <p className="p-6 text-center text-sm text-gray-500">Loading readings…</p>
        ) : (
          <>
            <ReadingsTable readings={data?.data ?? []} />
            {data && (
              <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400">
                Showing {data.data.length} of {data.meta.total} readings
              </p>
            )}
          </>
        )}
      </section>
    </DashboardLayout>
  );
}

export default App;
