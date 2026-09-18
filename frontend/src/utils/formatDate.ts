/** Formats a UTC ISO timestamp for display in the viewer's local time. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
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
