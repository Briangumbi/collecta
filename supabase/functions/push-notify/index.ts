// Supabase Edge Function — sends an Expo push notification when an invoice
// is marked paid, or when a new project message is posted.
//
// Wire this up with two Database Webhooks (Database > Webhooks in the
// Supabase dashboard), both pointing at this function's URL:
//   1. Table: invoices,  Events: UPDATE
//   2. Table: messages,  Events: INSERT
//
// Deploy: supabase functions deploy push-notify

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(supabaseUrl, serviceRoleKey);

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Record<string, any>;
  old_record: Record<string, any> | null;
}

Deno.serve(async (req) => {
  const payload = (await req.json()) as WebhookPayload;

  try {
    if (payload.table === 'invoices' && payload.type === 'UPDATE') {
      await handleInvoicePaid(payload);
    } else if (payload.table === 'messages' && payload.type === 'INSERT') {
      await handleNewMessage(payload);
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});

async function handleInvoicePaid(payload: WebhookPayload) {
  const { record, old_record } = payload;
  if (record.status !== 'paid' || old_record?.status === 'paid') return;

  const { data: freelancer } = await admin.from('profiles').select('push_token, name').eq('id', record.freelancer_id).single();
  if (!freelancer?.push_token) return;

  const { data: client } = await admin.from('profiles').select('name').eq('id', record.client_id).single();

  await sendExpoPush(freelancer.push_token, 'Invoice paid', `${client?.name ?? 'A client'} paid ${record.currency} ${record.amount}`);
}

async function handleNewMessage(payload: WebhookPayload) {
  const { record } = payload;

  const { data: project } = await admin.from('projects').select('freelancer_id, client_id, title').eq('id', record.project_id).single();
  if (!project) return;

  const recipientId = record.sender_id === project.freelancer_id ? project.client_id : project.freelancer_id;
  const { data: recipient } = await admin.from('profiles').select('push_token').eq('id', recipientId).single();
  const { data: sender } = await admin.from('profiles').select('name').eq('id', record.sender_id).single();
  if (!recipient?.push_token) return;

  await sendExpoPush(recipient.push_token, `New message · ${project.title}`, `${sender?.name ?? 'Someone'}: ${record.body}`);
}

async function sendExpoPush(token: string, title: string, body: string) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ to: token, title, body, sound: 'default' }),
  });
}
