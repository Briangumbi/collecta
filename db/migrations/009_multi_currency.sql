-- A freelancer's billing currency — pre-fills new invoices and scopes the
-- dashboard/client aggregate totals (which can't correctly sum across
-- different currencies). Per-invoice currency was already supported
-- (invoices.currency, defaulted to 'usd'); this is what was missing to
-- actually let a freelancer choose something else.
alter table public.profiles add column default_currency text not null default 'usd';

-- profiles_update_self's column-level GRANT (see 007_security_hardening.sql)
-- only allows a fixed column list — add this one to it.
grant update (default_currency) on public.profiles to authenticated;
