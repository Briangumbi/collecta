import { supabase } from '@/lib/supabase';

export type UpgradeOutcome = { status: 'success' } | { status: 'declined'; reason: string };

const PROCESSING_MIN_MS = 1500;
const PROCESSING_MAX_MS = 2500;
const RANDOM_DECLINE_CHANCE = 1 / 6;
const DECLINE_MESSAGE = 'Payment declined — please try again or use a different card.';
const PRO_PERIOD_DAYS = 30;

/**
 * Same simulated-payment pattern as invoice payments (see
 * use-simulated-payment.ts): mock card entry, an artificial processing
 * delay, and a client-side success/decline decision — no card data is ever
 * sent anywhere. It skips that flow's Edge Function step though: unlike
 * `invoices`, where clients have no UPDATE grant under RLS, the
 * `subscriptions_all_freelancer` policy (db/schema.sql) already lets a
 * freelancer write their own subscription row directly, so there's no
 * privileged write to broker server-side here.
 */
export function useSimulatedUpgrade() {
  const upgrade = async (freelancerId: string, cardNumber: string): Promise<UpgradeOutcome> => {
    const delay = PROCESSING_MIN_MS + Math.random() * (PROCESSING_MAX_MS - PROCESSING_MIN_MS);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const forcedDecline = cardNumber.replace(/\s/g, '').endsWith('0000');
    const randomDecline = !forcedDecline && Math.random() < RANDOM_DECLINE_CHANCE;
    if (forcedDecline || randomDecline) {
      return { status: 'declined', reason: DECLINE_MESSAGE };
    }

    const currentPeriodEnd = new Date(Date.now() + PRO_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const { error } = await supabase
      .from('subscriptions')
      .upsert(
        { freelancer_id: freelancerId, plan: 'pro', status: 'active', current_period_end: currentPeriodEnd.toISOString() },
        { onConflict: 'freelancer_id' }
      );
    if (error) {
      return { status: 'declined', reason: 'Something went wrong finalizing the upgrade — please try again.' };
    }
    return { status: 'success' };
  };

  return { upgrade };
}
