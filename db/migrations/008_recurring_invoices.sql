-- Recurring / templated invoices — a freelancer can save an invoice as a
-- repeating template (e.g. a monthly retainer) instead of recreating it by
-- hand every period. Generation runs entirely in Postgres via pg_cron, since
-- there's no always-on server to rely on otherwise.

create extension if not exists pg_cron with schema extensions;

create table public.invoice_templates (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'usd',
  interval text not null check (interval in ('weekly', 'monthly', 'quarterly', 'yearly')),
  -- Number of days after generation the produced invoice is due — mirrors the
  -- 14-day default already used for one-off invoices in the app.
  due_in_days int not null default 14 check (due_in_days >= 0),
  next_run_date date not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Links a generated invoice back to the template that produced it, so the UI
-- can badge it as recurring and so cancelling/pausing a template is
-- traceable to what it already generated.
alter table public.invoices add column template_id uuid references public.invoice_templates (id) on delete set null;

alter table public.invoice_templates enable row level security;

create policy "invoice_templates_all_freelancer" on public.invoice_templates
  for all using (freelancer_id = auth.uid() and public.is_freelancer())
  with check (freelancer_id = auth.uid() and public.is_freelancer());

-- Runs as the table owner (security definer) so it can insert/update across
-- every freelancer's templates from a scheduled job with no user session.
create or replace function public.generate_recurring_invoices()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  tmpl record;
  next_date date;
begin
  for tmpl in
    select * from public.invoice_templates
    where active and next_run_date <= current_date
  loop
    insert into public.invoices (freelancer_id, client_id, project_id, amount, currency, status, due_date, template_id)
    values (
      tmpl.freelancer_id,
      tmpl.client_id,
      tmpl.project_id,
      tmpl.amount,
      tmpl.currency,
      'sent',
      current_date + tmpl.due_in_days,
      tmpl.id
    );

    next_date := case tmpl.interval
      when 'weekly' then tmpl.next_run_date + interval '7 days'
      when 'monthly' then tmpl.next_run_date + interval '1 month'
      when 'quarterly' then tmpl.next_run_date + interval '3 months'
      when 'yearly' then tmpl.next_run_date + interval '1 year'
    end;

    update public.invoice_templates set next_run_date = next_date where id = tmpl.id;
  end loop;
end;
$$;

select cron.schedule(
  'generate-recurring-invoices',
  '0 6 * * *', -- daily at 06:00 UTC
  $$select public.generate_recurring_invoices();$$
);
