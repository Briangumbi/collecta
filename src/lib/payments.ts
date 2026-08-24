import { supabase } from '@/lib/supabase';

export async function finalizeSimulatedPayment(invoiceId: string) {
  const { data, error } = await supabase.functions.invoke<{ success: boolean; paymentRef: string | null }>(
    'simulate-payment',
    { body: { invoiceId } }
  );
  if (error) throw error;
  if (!data) throw new Error('No response from payment service.');
  return data;
}
