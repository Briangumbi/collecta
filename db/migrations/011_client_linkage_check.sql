-- Tightens the WITH CHECK on projects/invoices/invoice_templates: previously ownership
-- (freelancer_id = auth.uid()) plus role alone was enough to insert/update a row with
-- ANY client_id, letting a freelancer attach a project or invoice to an arbitrary user's
-- id — surfacing it to them under projects_select_client/invoices_select_client despite
-- no real relationship. Now also requires the client to be one of the freelancer's
-- linked clients (via freelancer_clients).
--
-- Safe for every existing code path: the app's client picker only ever offers
-- already-linked clients (getClients()), and create-client links freelancer_clients
-- atomically (via the admin client, bypassing RLS) before a client is usable at all —
-- so no legitimate row could ever fail this check. USING is untouched, so reading or
-- deleting existing rows is unaffected either way.

alter policy "projects_all_freelancer" on public.projects
  with check (
    freelancer_id = (select auth.uid())
    and (select public.is_freelancer())
    and exists (select 1 from public.freelancer_clients fc where fc.freelancer_id = projects.freelancer_id and fc.client_id = projects.client_id)
  );

alter policy "invoice_templates_all_freelancer" on public.invoice_templates
  with check (
    freelancer_id = (select auth.uid())
    and (select public.is_freelancer())
    and exists (select 1 from public.freelancer_clients fc where fc.freelancer_id = invoice_templates.freelancer_id and fc.client_id = invoice_templates.client_id)
  );

alter policy "invoices_all_freelancer" on public.invoices
  with check (
    freelancer_id = (select auth.uid())
    and (select public.is_freelancer())
    and exists (select 1 from public.freelancer_clients fc where fc.freelancer_id = invoices.freelancer_id and fc.client_id = invoices.client_id)
  );
