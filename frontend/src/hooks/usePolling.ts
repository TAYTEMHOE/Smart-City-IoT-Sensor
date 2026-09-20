import { useEffect, useRef, useState, useCallback } from 'react';

/** Shared refresh cadence for readings and alerts — F9 requires alerts to
 *  update on the same polling cycle as readings. */
export const POLL_INTERVAL_MS = 5000;

export interface PollingState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  /** Triggers an immediate fetch outside the regular interval (e.g. a retry button). */
  refetch: () => void;
}

/**
 * Generic setInterval-based refetch hook. Restarts whenever `deps` changes.
 * Guards against overlapping requests: if a fetch is still in flight when the
 * next tick fires (or refetch() is called), that tick is skipped rather than queued.
 */
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, deps: unknown[]): PollingState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const inFlightRef = useRef(false);
  const tickRef = useRef<() => void>(() => {});

  // oxlint-disable-next-line react-hooks/exhaustive-deps -- `deps` is intentionally caller-controlled
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const tick = async () => {
      if (inFlightRef.current) {
        return;
      }
      inFlightRef.current = true;
      try {
        const result = await fetcherRef.current();
        if (!cancelled) {
          setData(result);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        inFlightRef.current = false;
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    tickRef.current = () => void tick();
    void tick();
    const id = setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, deps); // oxlint-disable-line react-hooks/exhaustive-deps -- `deps` is intentionally caller-controlled

  const refetch = useCallback(() => {
    tickRef.current();
  }, []);

  return { data, error, isLoading, refetch };
}
