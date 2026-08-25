-- Replaces the "lime-noir" theme with "amber-noir" as the app's single
-- design (see src/theme/themes/amber-noir.ts). Updates the column default
-- and backfills any profile still pointing at the retired theme id.

alter table public.profiles alter column theme set default 'amber-noir';
update public.profiles set theme = 'amber-noir' where theme = 'lime-noir';
