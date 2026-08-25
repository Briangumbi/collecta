export function formatCurrency(amount: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Cosmetic short reference derived from the invoice's UUID — there's no separate invoice-number field. */
export function formatInvoiceRef(id: string) {
  return `INV-${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

/** Days until (positive) or since (negative) an ISO date, ignoring time-of-day. */
export function daysUntil(iso: string | null) {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** "Today" / "3d ago" / "2w ago" style relative time, for activity timestamps. */
export function formatRelativeTime(iso: string | null) {
  if (!iso) return '—';
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}
