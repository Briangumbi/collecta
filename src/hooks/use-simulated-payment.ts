import { finalizeSimulatedPayment } from '@/lib/payments';

export type PaymentOutcome = { status: 'success'; paymentRef: string } | { status: 'declined'; reason: string };

const PROCESSING_MIN_MS = 1500;
const PROCESSING_MAX_MS = 2500;
const RANDOM_DECLINE_CHANCE = 1 / 6;
const DECLINE_MESSAGE = 'Payment declined — please try again or use a different card.';

/**
 * Neither Stripe nor Flutterwave support account creation from this
 * project's target market, so the card form, the artificial processing
 * delay below, and the success/declined decision are all simulated
 * entirely client-side — no card data is ever sent anywhere. Only a
 * simulated *success* reaches the network at all, via
 * `finalizeSimulatedPayment`, which is the one part of this flow that's
 * still real: an authenticated call to a Supabase Edge Function that
 * writes `invoices.status = 'paid'` server-side (see
 * supabase/functions/simulate-payment).
 */
export function useSimulatedPayment() {
  const pay = async (invoiceId: string, cardNumber: string): Promise<PaymentOutcome> => {
    const delay = PROCESSING_MIN_MS + Math.random() * (PROCESSING_MAX_MS - PROCESSING_MIN_MS);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const forcedDecline = cardNumber.replace(/\s/g, '').endsWith('0000');
    const randomDecline = !forcedDecline && Math.random() < RANDOM_DECLINE_CHANCE;
    if (forcedDecline || randomDecline) {
      return { status: 'declined', reason: DECLINE_MESSAGE };
    }

    const result = await finalizeSimulatedPayment(invoiceId);
    if (!result.success || !result.paymentRef) {
      return { status: 'declined', reason: 'Something went wrong finalizing the payment — please try again.' };
    }
    return { status: 'success', paymentRef: result.paymentRef };
  };

  return { pay };
}
