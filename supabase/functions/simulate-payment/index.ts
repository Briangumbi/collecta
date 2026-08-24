// Finalizes a simulated invoice payment — no external processor call.
//
// Neither Stripe nor Flutterwave support account creation from this
// project's target market, so the "money movement" step is mocked entirely:
// the card-entry screen, the artificial processing delay, and the
// success/failure decision (see useSimulatedPayment) all happen client-side
// and never reach this function at all on a simulated decline. This
// function's only job is the one piece of the flow that's still "real" data
// flow — writing `status = 'paid'` — which stays server-side deliberately,
// the same way a genuine payment integration would: clients have no UPDATE
// grant on `invoices` under RLS (see db/schema.sql), so only this function
// (or the freelancer's own "mark as paid manually") can move an invoice to
// `paid`. Swapping in a real processor later means adding a real API call
// here and nowhere else — the rest of the app already expects this shape.
//
// Auth: expects the caller's Supabase access token in the Authorization
// header, so `invoices_select_client` (RLS) is what actually prevents a
// client from "paying" someone else's invoice.
//
// Deploy: supabase functions deploy simulate-payment

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Supabase doesn't add these for you — without them, calling this function
// from a browser (web build, or `expo start --web`) fails at the CORS
// preflight before the request body is ever read. Native iOS/Android never
// hits this, since CORS is a browser-only concept, but the function should
// work the same everywhere the app runs.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { invoiceId } = await req.json();
  if (!invoiceId) return json({ error: 'invoiceId is required' }, 400);

  const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('id, status').eq('id', invoiceId).single();
  if (invoiceError || !invoice) return json({ error: 'Invoice not found' }, 404);
  if (invoice.status === 'paid') return json({ success: true, paymentRef: null }); // idempotent

  const paymentRef = `MOCK-${crypto.randomUUID()}`;
  const paymentTransactionId = `MOCK-TXN-${crypto.randomUUID()}`;

  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error: updateError } = await admin
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_ref: paymentRef,
      payment_transaction_id: paymentTransactionId,
    })
    .eq('id', invoiceId);
  if (updateError) return json({ error: 'Could not update invoice' }, 500);

  return json({ success: true, paymentRef });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
