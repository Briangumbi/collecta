-- Ledger — schema, indexes, and Row Level Security policies.
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('freelancer', 'client')),
  name text not null,
  avatar_url text,
  email text not null,
  push_token text,
  created_at timestamptz not null default now()
);

create table public.freelancer_clients (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (freelancer_id, client_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'on_hold')),
  created_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'complete')),
  due_date date
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'usd',
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  -- Processor-neutral on purpose: payments are currently simulated client-side
  -- (see supabase/functions/simulate-payment) rather than run through a real
  -- gateway, but these fields are exactly what a real integration would also
  -- populate, so swapping one in later is a drop-in change.
  payment_ref text,
  payment_transaction_id text,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  file_url text not null,
  type text not null check (type in ('deliverable', 'receipt')),
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null unique references public.profiles (id) on delete cascade,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active',
  current_period_end timestamptz
);

-- Denormalized feed the dashboard subscribes to via Realtime. Populated by
-- triggers below so the client never has to compute "what happened" itself.
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('invoice_paid', 'invoice_sent', 'new_message', 'project_created', 'milestone_complete')),
  title text not null,
  subtitle text,
  created_at timestamptz not null default now()
);

create index invoices_freelancer_id_idx on public.invoices (freelancer_id);
create index invoices_client_id_idx on public.invoices (client_id);
create index invoices_status_idx on public.invoices (status);
create index projects_freelancer_id_idx on public.projects (freelancer_id);
create index projects_client_id_idx on public.projects (client_id);
create index milestones_project_id_idx on public.milestones (project_id);
create index messages_project_id_idx on public.messages (project_id);
create index attachments_project_id_idx on public.attachments (project_id);
create index activity_events_freelancer_id_idx on public.activity_events (freelancer_id, created_at desc);

-- ---------------------------------------------------------------------------
-- New-user hook: create a profile row from auth signup metadata.
-- The app passes { name, role } as user metadata on supabase.auth.signUp().
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Activity feed triggers
-- ---------------------------------------------------------------------------

create function public.log_invoice_activity()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  client_name text;
begin
  if tg_op = 'UPDATE' and new.status = 'paid' and old.status is distinct from 'paid' then
    select name into client_name from public.profiles where id = new.client_id;
    insert into public.activity_events (freelancer_id, type, title, subtitle)
    values (new.freelancer_id, 'invoice_paid', 'Invoice paid', client_name || ' paid ' || new.currency || ' ' || new.amount);
  elsif tg_op = 'UPDATE' and new.status = 'sent' and old.status is distinct from 'sent' then
    select name into client_name from public.profiles where id = new.client_id;
    insert into public.activity_events (freelancer_id, type, title, subtitle)
    values (new.freelancer_id, 'invoice_sent', 'Invoice sent', 'Sent to ' || client_name);
  end if;
  return new;
end;
$$;

create trigger on_invoice_status_change
  after update on public.invoices
  for each row execute procedure public.log_invoice_activity();

create function public.log_message_activity()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  proj record;
  sender_name text;
begin
  select p.freelancer_id, p.client_id, p.title into proj
  from public.projects p where p.id = new.project_id;

  select name into sender_name from public.profiles where id = new.sender_id;

  insert into public.activity_events (freelancer_id, type, title, subtitle)
  values (proj.freelancer_id, 'new_message', 'New message', sender_name || ' on ' || proj.title);

  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.log_message_activity();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.freelancer_clients enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.invoices enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.activity_events enable row level security;

-- profiles: everyone can read their own row, plus the counterparties they
-- transact with (a freelancer's clients, and vice versa); only self-update.
create policy "profiles_select_self" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_counterparty" on public.profiles
  for select using (
    exists (
      select 1 from public.freelancer_clients fc
      where (fc.freelancer_id = auth.uid() and fc.client_id = profiles.id)
         or (fc.client_id = auth.uid() and fc.freelancer_id = profiles.id)
    )
  );

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- freelancer_clients
create policy "freelancer_clients_select" on public.freelancer_clients
  for select using (freelancer_id = auth.uid() or client_id = auth.uid());

create policy "freelancer_clients_insert" on public.freelancer_clients
  for insert with check (freelancer_id = auth.uid());

-- projects
create policy "projects_all_freelancer" on public.projects
  for all using (freelancer_id = auth.uid()) with check (freelancer_id = auth.uid());

create policy "projects_select_client" on public.projects
  for select using (client_id = auth.uid());

-- milestones (scoped through parent project)
create policy "milestones_all_freelancer" on public.milestones
  for all using (
    exists (select 1 from public.projects p where p.id = milestones.project_id and p.freelancer_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = milestones.project_id and p.freelancer_id = auth.uid())
  );

create policy "milestones_select_client" on public.milestones
  for select using (
    exists (select 1 from public.projects p where p.id = milestones.project_id and p.client_id = auth.uid())
  );

-- invoices
create policy "invoices_all_freelancer" on public.invoices
  for all using (freelancer_id = auth.uid()) with check (freelancer_id = auth.uid());

create policy "invoices_select_client" on public.invoices
  for select using (client_id = auth.uid());

-- messages: freelancer and client can both read; each can only insert as themself
create policy "messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = messages.project_id
        and (p.freelancer_id = auth.uid() or p.client_id = auth.uid())
    )
  );

create policy "messages_insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.projects p
      where p.id = messages.project_id
        and (p.freelancer_id = auth.uid() or p.client_id = auth.uid())
    )
  );

-- attachments: freelancer manages, client can only view
create policy "attachments_all_freelancer" on public.attachments
  for all using (
    exists (select 1 from public.projects p where p.id = attachments.project_id and p.freelancer_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = attachments.project_id and p.freelancer_id = auth.uid())
  );

create policy "attachments_select_client" on public.attachments
  for select using (
    exists (select 1 from public.projects p where p.id = attachments.project_id and p.client_id = auth.uid())
  );

-- subscriptions: freelancer only, own row
create policy "subscriptions_all_freelancer" on public.subscriptions
  for all using (freelancer_id = auth.uid()) with check (freelancer_id = auth.uid());

-- activity_events: freelancer only, own feed, read-only from the client app
-- (rows are written by the SECURITY DEFINER trigger functions above)
create policy "activity_events_select_freelancer" on public.activity_events
  for select using (freelancer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage — receipts and deliverables, one bucket keyed by project id
-- (object path convention: `${project_id}/${filename}`)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "attachments_storage_select" on storage.objects
  for select using (
    bucket_id = 'attachments'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[1]
        and (p.freelancer_id = auth.uid() or p.client_id = auth.uid())
    )
  );

create policy "attachments_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'attachments'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[1]
        and p.freelancer_id = auth.uid()
    )
  );

create policy "attachments_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'attachments'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[1]
        and p.freelancer_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.activity_events;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.invoices;
