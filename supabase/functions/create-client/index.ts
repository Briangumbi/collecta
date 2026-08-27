// Creates a client account on a freelancer's behalf and links it to them.
//
// A `profiles` row can only exist for a real `auth.users` row (foreign key),
// so "adding a client" from the freelancer side means provisioning that
// client's account server-side — the anon key can't call the admin API, so
// this has to be a privileged Edge Function, the same reasoning as
// simulate-payment's server-side write.
//
// If the email already belongs to an existing client profile, this just
// links that existing client to the calling freelancer instead of erroring
// — handles "this person already has a Collecta account" gracefully.
//
// A newly-created client gets a random temporary password, returned once in
// the response for the freelancer to relay — there's no email delivery
// configured in this project, so a magic-link/invite-email flow isn't
// available here.
//
// Auth: expects the caller's Supabase access token in the Authorization
// header; the caller must be an existing freelancer profile.
//
// Deploy: supabase functions deploy create-client

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

  const caller = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await caller.auth.getUser();
  if (userError || !user) return json({ error: 'Not authenticated' }, 401);

  const { data: callerProfile, error: callerProfileError } = await caller
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();
  if (callerProfileError || !callerProfile) return json({ error: 'Profile not found' }, 404);
  if (callerProfile.role !== 'freelancer') return json({ error: 'Only freelancers can add clients' }, 403);

  const { name, email } = await req.json();
  if (!name?.trim() || !email?.trim()) return json({ error: 'Name and email are required' }, 400);
  const normalizedEmail = email.trim().toLowerCase();

  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: existing } = await admin.from('profiles').select('id, role').eq('email', normalizedEmail).maybeSingle();
  if (existing && existing.role !== 'client') {
    return json({ error: 'This email belongs to a non-client account.' }, 409);
  }

  let clientId: string;
  let tempPassword: string | null = null;

  if (existing) {
    clientId = existing.id;
  } else {
    tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: name.trim(), role: 'client' },
    });
    if (createError || !created.user) return json({ error: createError?.message ?? 'Could not create client account' }, 500);
    clientId = created.user.id;
  }

  const { error: linkError } = await admin
    .from('freelancer_clients')
    .upsert({ freelancer_id: callerProfile.id, client_id: clientId }, { onConflict: 'freelancer_id,client_id', ignoreDuplicates: true });
  if (linkError) return json({ error: 'Could not link client' }, 500);

  return json({ success: true, clientId, isNewAccount: tempPassword !== null, tempPassword });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
