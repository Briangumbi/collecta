-- Renames the Flutterwave-specific invoice columns to processor-neutral
-- names, now that payments are simulated client-side instead of running
-- through a real gateway (see supabase/functions/simulate-payment). Run
-- this once in the Supabase SQL editor against a project that already has
-- 002_flutterwave_payments.sql applied. `db/schema.sql` creates the
-- renamed columns directly for anyone setting up a fresh project.

alter table public.invoices rename column flutterwave_tx_ref to payment_ref;
alter table public.invoices rename column flutterwave_transaction_id to payment_transaction_id;
