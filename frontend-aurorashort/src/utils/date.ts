// Human-friendly date/time helpers. All formatting uses the browser's local timezone.

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/** "5 minutes ago" style relative time, falling back to a date for anything over a week old. */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(iso);
}

export interface ExpirationState {
  label: string;
  tone: 'active' | 'soon' | 'expired' | 'never';
}

/** Describes an expiresAt timestamp (or its absence) as a semantic state + label. */
export function getExpirationState(
  expiresAt: string | null | undefined,
  status?: string,
): ExpirationState {
  if (status === 'expired') {
    return { label: 'Expired', tone: 'expired' };
  }
  if (!expiresAt) {
    return { label: 'Never expires', tone: 'never' };
  }
  const expiryMs = new Date(expiresAt).getTime();
  const now = Date.now();
  if (expiryMs <= now) {
    return { label: 'Expired', tone: 'expired' };
  }
  const diffMs = expiryMs - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 1) {
    const diffHrs = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
    return { label: `Expires in ${diffHrs}h`, tone: 'soon' };
  }
  if (diffDays < 3) {
    return { label: `Expires in ${Math.round(diffDays)}d`, tone: 'soon' };
  }
  return { label: `Expires in ${Math.round(diffDays)}d`, tone: 'active' };
}

/** ISO string for "now + N days", suitable for the expiresAt field. */
export function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Minimum value for a <input type="datetime-local"> so users can't pick the past. */
export function minDateTimeLocal(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
