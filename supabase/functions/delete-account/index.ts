// Permanently deletes the calling user's own account (GDPR/CCPA
// right-to-erasure). Requires the service role's admin API, same reasoning
// as create-client — the anon/authenticated key can't delete an auth.users
// row, only an admin client can.
//
// Every table that references profiles.id does so with `on delete cascade`
// (see db/schema.sql), so deleting the auth.users row cascades through
// profiles and every row that freelancer/client ever owned — their own
// freelancer_clients links, projects, invoices, milestones, messages,
// attachments, subscriptions, activity feed. A freelancer deleting their
// account does NOT delete their clients' own accounts (those are separate
// profiles rows, only referenced, not owned); a client deleting their
// account DOES cascade away the freelancer's projects/invoices for that
// client, since those rows are keyed by client_id — the UI warns about this
// before confirming.
//
// Known limitation: this does not clean up files already uploaded to
// Supabase Storage under a deleted project (storage.objects isn't linked by
// a Postgres FK, so cascade doesn't reach it) — those become orphaned but
// inaccessible (RLS on storage.objects still requires a matching project
// row, which is now gone). Acceptable for now; worth a scheduled cleanup
// job later if storage cost becomes a concern.
//
// Auth: expects the caller's own Supabase access token in the Authorization
// header — there is no "delete someone else's account" path here.
//
// Deploy: supabase functions deploy delete-account

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

  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return json({ error: deleteError.message }, 500);

  return json({ success: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
