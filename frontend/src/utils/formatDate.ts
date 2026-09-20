/** Formats a UTC ISO timestamp for display in the viewer's local time. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

/** Formats a UTC ISO timestamp as a short local time (for compact chart axes). */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/** Converts a UTC ISO timestamp to a value usable in a `datetime-local` input. */
export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/** Converts a `datetime-local` input value back to a UTC ISO timestamp. */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
