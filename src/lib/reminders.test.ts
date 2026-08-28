import { summarizeReminderResults, type ReminderResult } from './reminders';

// reminders.ts imports the real supabase client (which needs a native AsyncStorage
// module not present under Jest) just to reach `summarizeReminderResults`, a pure
// function that never touches it — stub the module out rather than pull that in.
// Jest hoists this above the import above at transform time regardless of source order.
jest.mock('@/lib/supabase', () => ({ supabase: {} }));

function result(sent: boolean): ReminderResult {
  return { invoiceId: 'inv', clientName: 'Client', sent };
}

describe('summarizeReminderResults', () => {
  it('handles no overdue invoices at all', () => {
    expect(summarizeReminderResults([])).toBe('No overdue invoices right now.');
  });

  it('handles none sent', () => {
    expect(summarizeReminderResults([result(false), result(false)])).toBe(
      "None of your overdue clients have notifications enabled yet."
    );
  });

  it('handles all sent, singular', () => {
    expect(summarizeReminderResults([result(true)])).toBe('Reminder sent to 1 client.');
  });

  it('handles all sent, plural', () => {
    expect(summarizeReminderResults([result(true), result(true)])).toBe('Reminder sent to 2 clients.');
  });

  it('handles a partial send', () => {
    expect(summarizeReminderResults([result(true), result(false), result(true)])).toBe(
      "Sent to 2 of 3 clients — the rest don't have notifications enabled."
    );
  });
});
