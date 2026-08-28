-- Lets a chat message carry an image, not just text. Shares the `attachments`
-- storage bucket/policies with project receipts/deliverables (already scoped
-- to the project's freelancer+client) — no separate junction row needed.
alter table public.messages alter column body drop not null;
alter table public.messages add column image_url text;
alter table public.messages add constraint messages_body_or_image_check check (body is not null or image_url is not null);
