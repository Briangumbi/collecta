-- Swaps the Stripe payment-intent column for Flutterwave's reference fields.
-- Run this once in the Supabase SQL editor against a project that already
-- has db/schema.sql applied. `db/schema.sql` itself has been updated to
-- create the new columns directly for anyone setting up a fresh project.

alter table public.invoices drop column if exists stripe_payment_intent_id;
alter table public.invoices add column if not exists flutterwave_tx_ref text;
alter table public.invoices add column if not exists flutterwave_transaction_id text;
