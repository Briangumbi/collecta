import { daysUntil, formatCurrency, formatDate, formatInvoiceRef, formatRelativeTime, getCurrencySymbol } from './format';

describe('formatCurrency', () => {
  it('collapses decimals for whole-number amounts', () => {
    expect(formatCurrency(4200, 'usd')).toBe('$4,200');
  });

  it('keeps cents for fractional amounts (regression: used to hardcode maximumFractionDigits: 0)', () => {
    expect(formatCurrency(99.99, 'usd')).toBe('$99.99');
    expect(formatCurrency(1250.5, 'usd')).toBe('$1,250.50');
  });

  it('formats other currencies with their own symbol', () => {
    expect(formatCurrency(100, 'eur')).toBe('€100');
    expect(formatCurrency(100, 'gbp')).toBe('£100');
  });

  it('is case-insensitive on the currency code', () => {
    expect(formatCurrency(100, 'USD')).toBe(formatCurrency(100, 'usd'));
  });
});

describe('getCurrencySymbol', () => {
  it('returns just the symbol, not the full formatted amount', () => {
    expect(getCurrencySymbol('usd')).toBe('$');
    expect(getCurrencySymbol('eur')).toBe('€');
    expect(getCurrencySymbol('gbp')).toBe('£');
  });
});

describe('formatDate', () => {
  it('returns an em dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('formats an ISO date as "Mon D, YYYY"', () => {
    expect(formatDate('2026-03-05T00:00:00.000Z')).toBe('Mar 5, 2026');
  });
});

describe('formatInvoiceRef', () => {
  it('derives a 4-char uppercase ref from the id, stripping dashes', () => {
    expect(formatInvoiceRef('a1b2c3d4-0000-0000-0000-000000000000')).toBe('INV-A1B2');
  });
});

describe('daysUntil', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-28T15:00:00.000Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null for null input', () => {
    expect(daysUntil(null)).toBeNull();
  });

  it('returns a positive count for a future date', () => {
    expect(daysUntil('2026-09-07')).toBe(10);
  });

  it('returns a negative count for a past date', () => {
    expect(daysUntil('2026-08-18')).toBe(-10);
  });

  it('ignores time-of-day — "today" is always 0 regardless of the current hour', () => {
    expect(daysUntil('2026-08-28')).toBe(0);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-28T12:00:00.000Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns an em dash for null', () => {
    expect(formatRelativeTime(null)).toBe('—');
  });

  it('labels the same day as "Today"', () => {
    expect(formatRelativeTime('2026-08-28T09:00:00.000Z')).toBe('Today');
  });

  it('labels one day back as "Yesterday"', () => {
    expect(formatRelativeTime('2026-08-27T12:00:00.000Z')).toBe('Yesterday');
  });

  it('uses "Nd ago" under a week', () => {
    expect(formatRelativeTime('2026-08-24T12:00:00.000Z')).toBe('4d ago');
  });

  it('switches to "Nw ago" under a month', () => {
    expect(formatRelativeTime('2026-08-10T12:00:00.000Z')).toBe('3w ago');
  });

  it('switches to "Nmo ago" beyond a month', () => {
    expect(formatRelativeTime('2026-05-28T12:00:00.000Z')).toBe('3mo ago');
  });
});
