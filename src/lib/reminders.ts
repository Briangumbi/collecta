import { formatCurrency, formatInvoiceRef } from '@/lib/format';
import { supabase } from '@/lib/supabase';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export interface ReminderResult {
  invoiceId: string;
  clientName: string;
  sent: boolean;
  reason?: string;
}

/** Just what a reminder needs — decoupled from any one query's exact return shape. */
export interface ReminderInvoice {
  id: string;
  client_id: string;
  amount: number | string;
  currency: string;
  client?: { name: string } | null;
}

/**
 * Sends a payment-reminder push straight to the client's device, no server
 * round-trip beyond Expo's own push API — a freelancer already has RLS read
 * access to their linked clients' `push_token` (see profiles_select_counterparty
 * in db/schema.sql), so there's no privileged write here that would need an
 * Edge Function the way simulate-payment/create-client do.
 */
export async function sendPaymentReminder(invoice: ReminderInvoice): Promise<ReminderResult> {
  const clientName = invoice.client?.name ?? 'Client';

  const { data: clientProfile, error } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', invoice.client_id)
    .maybeSingle();
  if (error || !clientProfile?.push_token) {
    return { invoiceId: invoice.id, clientName, sent: false, reason: 'No notifications enabled for this client' };
  }

  const amount = formatCurrency(Number(invoice.amount), invoice.currency);
  let response: Response;
  try {
    response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        to: clientProfile.push_token,
        title: 'Payment reminder',
        body: `${formatInvoiceRef(invoice.id)} for ${amount} is still outstanding.`,
        data: { invoiceId: invoice.id, type: 'payment_reminder' },
      }),
    });
  } catch {
    return { invoiceId: invoice.id, clientName, sent: false, reason: 'Could not reach the notification service' };
  }
  if (!response.ok) {
    return { invoiceId: invoice.id, clientName, sent: false, reason: 'Could not reach the notification service' };
  }
  return { invoiceId: invoice.id, clientName, sent: true };
}

export async function sendPaymentReminders(invoices: ReminderInvoice[]): Promise<ReminderResult[]> {
  return Promise.all(invoices.map(sendPaymentReminder));
}

/** One-line summary for an Alert — e.g. "Sent to 2 clients" or "No clients have notifications enabled". */
export function summarizeReminderResults(results: ReminderResult[]): string {
  const sent = results.filter((r) => r.sent).length;
  if (results.length === 0) return 'No overdue invoices right now.';
  if (sent === 0) return 'None of your overdue clients have notifications enabled yet.';
  if (sent === results.length) return `Reminder sent to ${sent} client${sent === 1 ? '' : 's'}.`;
  return `Sent to ${sent} of ${results.length} clients — the rest don't have notifications enabled.`;
}
