/**
 * Seeds a fresh Supabase project with a demo freelancer, fake clients,
 * projects, milestones, invoices, and a message thread.
 *
 * Requires the *service role* key (bypasses RLS) — never ship this key in
 * the app. Run once per environment:
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts
 *
 * or put those two vars (plus EXPO_PUBLIC_SUPABASE_URL as a fallback) in a
 * local .env file — dotenv is loaded below.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

import { DEMO_FREELANCER_EMAIL, DEMO_FREELANCER_PASSWORD } from '../src/lib/demo';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
  throw new Error('unreachable');
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CLIENTS = [
  { email: 'jane@acme.test', name: 'Jane Whitfield', company: 'Acme Co' },
  { email: 'marcus@brightpath.test', name: 'Marcus Reyes', company: 'Brightpath Studio' },
  { email: 'sofia@northwind.test', name: 'Sofia Okafor', company: 'Northwind Goods' },
  { email: 'tom@heliocraft.test', name: 'Tom Delaney', company: 'Heliocraft' },
];

const DEMO_PASSWORD = 'collecta-demo-2026';

async function getOrCreateUser(email: string, password: string, name: string, role: 'freelancer' | 'client') {
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === email);
  if (found) return found.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (error || !data.user) throw error ?? new Error(`Failed to create user ${email}`);
  return data.user.id;
}

async function main() {
  console.log('Seeding demo freelancer...');
  const freelancerId = await getOrCreateUser(DEMO_FREELANCER_EMAIL, DEMO_FREELANCER_PASSWORD, 'Alex Rivera', 'freelancer');

  console.log('Seeding clients...');
  const clientIds: Record<string, string> = {};
  for (const c of CLIENTS) {
    const id = await getOrCreateUser(c.email, DEMO_PASSWORD, c.company, 'client');
    clientIds[c.company] = id;
    await admin
      .from('freelancer_clients')
      .upsert({ freelancer_id: freelancerId, client_id: id }, { onConflict: 'freelancer_id,client_id' });
  }

  // Re-running this script should reset to a clean demo state, not pile up
  // duplicates — user creation above is idempotent (getOrCreateUser), but
  // projects/invoices/messages/milestones/attachments are plain inserts, so
  // clear out anything from a previous run before recreating them.
  console.log('Clearing previous demo data...');
  await admin.from('invoices').delete().eq('freelancer_id', freelancerId);
  await admin.from('activity_events').delete().eq('freelancer_id', freelancerId);
  await admin.from('projects').delete().eq('freelancer_id', freelancerId); // cascades to milestones/messages/attachments

  console.log('Seeding subscription (Pro plan, demo)...');
  await admin
    .from('subscriptions')
    .upsert(
      { freelancer_id: freelancerId, plan: 'pro', status: 'active', current_period_end: futureDate(21) },
      { onConflict: 'freelancer_id' }
    );

  console.log('Seeding projects + milestones...');
  const acmeId = clientIds['Acme Co'];
  const brightpathId = clientIds['Brightpath Studio'];
  const northwindId = clientIds['Northwind Goods'];

  const { data: project1 } = await admin
    .from('projects')
    .insert({ freelancer_id: freelancerId, client_id: acmeId, title: 'Website Redesign', status: 'active' })
    .select()
    .single();

  const { data: project2 } = await admin
    .from('projects')
    .insert({ freelancer_id: freelancerId, client_id: brightpathId, title: 'Brand Identity Refresh', status: 'on_hold' })
    .select()
    .single();

  const { data: project3 } = await admin
    .from('projects')
    .insert({ freelancer_id: freelancerId, client_id: northwindId, title: 'Product Photography', status: 'completed' })
    .select()
    .single();

  if (project1) {
    await admin.from('milestones').insert([
      { project_id: project1.id, title: 'Discovery & wireframes', status: 'complete', due_date: pastDate(30) },
      { project_id: project1.id, title: 'Visual design', status: 'complete', due_date: pastDate(10) },
      { project_id: project1.id, title: 'Build & QA', status: 'pending', due_date: futureDate(14) },
    ]);
    await admin.from('messages').insert([
      {
        project_id: project1.id,
        sender_id: acmeId,
        body: "Hey Alex, loving the new homepage direction. Can we push the CTA button color closer to our brand blue?",
        created_at: hoursAgo(30),
      },
      {
        project_id: project1.id,
        sender_id: freelancerId,
        body: 'Absolutely — I\'ll swap it to #1D4ED8 and send an updated preview this afternoon.',
        created_at: hoursAgo(29),
      },
      {
        project_id: project1.id,
        sender_id: acmeId,
        body: 'Perfect, thank you! Also — any update on the mobile nav?',
        created_at: hoursAgo(3),
      },
    ]);
  }

  if (project2) {
    await admin.from('milestones').insert([
      { project_id: project2.id, title: 'Logo exploration', status: 'complete', due_date: pastDate(45) },
      { project_id: project2.id, title: 'Style guide', status: 'pending', due_date: futureDate(30) },
    ]);
  }

  if (project3) {
    await admin.from('milestones').insert([
      { project_id: project3.id, title: 'Shoot day', status: 'complete', due_date: pastDate(60) },
      { project_id: project3.id, title: 'Retouch & deliver', status: 'complete', due_date: pastDate(50) },
    ]);
  }

  console.log('Seeding invoices...');
  await admin.from('invoices').insert([
    {
      freelancer_id: freelancerId,
      client_id: acmeId,
      project_id: project1?.id,
      amount: 4200,
      status: 'paid',
      due_date: pastDate(20),
      paid_at: pastDate(18),
    },
    {
      freelancer_id: freelancerId,
      client_id: acmeId,
      project_id: project1?.id,
      amount: 2800,
      status: 'sent',
      due_date: futureDate(10),
    },
    {
      freelancer_id: freelancerId,
      client_id: brightpathId,
      project_id: project2?.id,
      amount: 1500,
      status: 'overdue',
      due_date: pastDate(5),
    },
    {
      freelancer_id: freelancerId,
      client_id: brightpathId,
      project_id: project2?.id,
      amount: 3000,
      status: 'draft',
      due_date: futureDate(21),
    },
    {
      freelancer_id: freelancerId,
      client_id: northwindId,
      project_id: project3?.id,
      amount: 950,
      status: 'paid',
      due_date: pastDate(55),
      paid_at: pastDate(52),
    },
    {
      freelancer_id: freelancerId,
      client_id: northwindId,
      amount: 600,
      status: 'paid',
      due_date: pastDate(90),
      paid_at: pastDate(88),
    },
    {
      freelancer_id: freelancerId,
      client_id: clientIds['Heliocraft'],
      amount: 5400,
      status: 'sent',
      due_date: futureDate(30),
    },
    {
      freelancer_id: freelancerId,
      client_id: clientIds['Heliocraft'],
      amount: 1200,
      status: 'overdue',
      due_date: pastDate(2),
    },
  ]);

  console.log('Done. Demo freelancer login:', DEMO_FREELANCER_EMAIL, '/', DEMO_FREELANCER_PASSWORD);
}

function pastDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}
function futureDate(daysAhead: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString();
}
function hoursAgo(hours: number) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
