-- Security hardening pass. Closes two real gaps found by auditing the RLS
-- policy set directly (not just the app's own UI gating, which is not a
-- security boundary — anyone with a valid session token can call the
-- Supabase REST API directly, bypassing the app entirely).

-- ---------------------------------------------------------------------------
-- 1) Self-service role tampering.
--
-- profiles_update_self only restricts *which row* a user can update
-- (id = auth.uid()) — it never restricted *which columns*. That means any
-- authenticated user, including a client-role account, could currently do:
--   supabase.from('profiles').update({ role: 'freelancer' }).eq('id', me)
-- and grant themselves the freelancer role directly, which is the sole
-- boundary this whole app's data model is built on (freelancers create
-- clients/projects/invoices; clients only view/pay). RLS's WITH CHECK can't
-- compare OLD vs NEW column values on its own, so this is fixed at the
-- privilege layer instead: restrict which columns `authenticated` may ever
-- write on this table to exactly what the app legitimately updates today
-- (verified by grepping every `.from('profiles').update(...)` call site).
-- `id`, `role`, and `email` are excluded on purpose — email changes must go
-- through supabase.auth.updateUser() (Settings > Email & Password), which
-- verifies the new address before it takes effect; role is fixed at signup.
-- ---------------------------------------------------------------------------

revoke update on public.profiles from authenticated;
grant update (name, avatar_url, push_token, theme, notification_prefs) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Freelancer-owned tables didn't verify the caller actually holds the
-- freelancer role.
--
-- projects_all_freelancer, invoices_all_freelancer, subscriptions_all_freelancer,
-- and freelancer_clients_insert all only checked "freelancer_id = auth.uid()"
-- — satisfied by ANY authenticated user naming themselves as the freelancer,
-- role notwithstanding. A client-role account could insert e.g. a bogus
-- project or invoice with freelancer_id = themselves and client_id = some
-- unrelated real user, which would then surface in that unrelated user's own
-- client-scoped views (projects_select_client / invoices_select_client).
-- milestones/attachments/messages aren't touched here — they're scoped
-- through an existing project's freelancer_id, so once projects can only be
-- created by a genuine freelancer, those cascade-protect automatically.
-- ---------------------------------------------------------------------------

create or replace function public.is_freelancer()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'freelancer');
$$;

drop policy if exists "freelancer_clients_insert" on public.freelancer_clients;
create policy "freelancer_clients_insert" on public.freelancer_clients
  for insert with check (freelancer_id = auth.uid() and public.is_freelancer());

drop policy if exists "projects_all_freelancer" on public.projects;
create policy "projects_all_freelancer" on public.projects
  for all using (freelancer_id = auth.uid() and public.is_freelancer())
  with check (freelancer_id = auth.uid() and public.is_freelancer());

drop policy if exists "invoices_all_freelancer" on public.invoices;
create policy "invoices_all_freelancer" on public.invoices
  for all using (freelancer_id = auth.uid() and public.is_freelancer())
  with check (freelancer_id = auth.uid() and public.is_freelancer());

drop policy if exists "subscriptions_all_freelancer" on public.subscriptions;
create policy "subscriptions_all_freelancer" on public.subscriptions
  for all using (freelancer_id = auth.uid() and public.is_freelancer())
  with check (freelancer_id = auth.uid() and public.is_freelancer());
