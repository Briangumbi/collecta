-- Adds persisted notification preferences to profiles. Previously the
-- Settings toggles were local component state only and reset on reload.

alter table public.profiles
  add column if not exists notification_prefs jsonb not null default
    '{"invoicePaid":true,"paymentReminders":true,"weeklyReport":false,"projectUpdates":true,"marketing":false}'::jsonb;
