-- Adds the selected visual style to profiles, for the multi-theme system
-- (see src/theme). Persisted server-side so it follows the freelancer
-- across devices rather than being a device-local preference.

alter table public.profiles add column if not exists theme text not null default 'lime-noir';
