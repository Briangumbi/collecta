import { supabase } from '@/lib/supabase';
import { getDashboardSummary } from './queries';

// Jest hoists jest.mock() calls above the imports above at transform time,
// regardless of source order — see babel-plugin-jest-hoist.
jest.mock('@/lib/supabase', () => ({ supabase: { from: jest.fn() } }));

/** Minimal stand-in for supabase-js's chainable query builder — `.select`/`.eq` just
 *  return itself, and the object resolves (via `then`) to the given result when awaited. */
interface ChainableBuilder {
  select: () => ChainableBuilder;
  eq: () => ChainableBuilder;
  then: (resolve: (value: unknown) => void) => void;
}

function chainable(result: unknown): ChainableBuilder {
  const builder: ChainableBuilder = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    then: (resolve) => resolve(result),
  };
  return builder;
}

describe('getDashboardSummary', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-28T12:00:00.000Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('scopes totals to the given currency and buckets by status correctly', async () => {
    const invoices = [
      { amount: 1000, status: 'sent', paid_at: null, client_id: 'c1' },
      { amount: 500, status: 'overdue', paid_at: null, client_id: 'c2' },
      { amount: 2000, status: 'paid', paid_at: '2026-08-10T00:00:00.000Z', client_id: 'c1' },
      // paid last month — should count in revenueByMonth but NOT in "paid this month"
      { amount: 300, status: 'paid', paid_at: '2026-07-10T00:00:00.000Z', client_id: 'c3' },
      // draft — shouldn't count toward outstanding, paid, or revenue anywhere
      { amount: 999, status: 'draft', paid_at: null, client_id: 'c4' },
    ];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'invoices') return chainable({ data: invoices, error: null });
      if (table === 'projects') return chainable({ count: 2, error: null });
      throw new Error(`unexpected table ${table}`);
    });

    const summary = await getDashboardSummary('freelancer-1', 'usd');

    expect(summary.outstandingTotal).toBe(1500); // 1000 sent + 500 overdue
    expect(summary.outstandingInvoiceCount).toBe(2);
    expect(summary.outstandingClientCount).toBe(2); // distinct clients c1, c2
    expect(summary.overdueInvoiceCount).toBe(1);
    expect(summary.activeProjectCount).toBe(2);
    expect(summary.paidThisMonth).toBe(2000); // only the August paid invoice
    expect(summary.revenueByMonth).toHaveLength(6);
    expect(summary.revenueByMonth[5]).toEqual({ month: 'Aug', total: 2000 });
    expect(summary.revenueByMonth[4]).toEqual({ month: 'Jul', total: 300 });
  });

  it('propagates an invoices query error instead of returning a partial summary', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'invoices') return chainable({ data: null, error: new Error('boom') });
      return chainable({ count: 0, error: null });
    });

    await expect(getDashboardSummary('freelancer-1', 'usd')).rejects.toThrow('boom');
  });
});
