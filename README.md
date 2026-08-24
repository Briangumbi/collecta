# Ledger

A mobile client-portal app for freelancers and small agencies — manage clients, projects, invoices,
and get paid, from one app. Two roles share the same codebase: **Freelancer** (full management view)
and **Client** (scoped read-only + payment view).

Built with Expo (React Native + TypeScript) and Supabase (Postgres, Auth, Row Level Security,
Realtime). Invoice payments are **simulated** — see [Payments](#4-payments--simulated) below for why.

## Stack

- Expo SDK 57, Expo Router (file-based navigation), TypeScript
- Supabase — Postgres, Auth, RLS, Realtime, Storage, Edge Functions
- Simulated card-entry payment flow (no real processor — see below) — invoice payments
- `expo-local-authentication` — biometric app unlock
- `expo-sqlite` — local cache for offline dashboard/invoice/client data
- `react-native-reanimated` + `react-native-gesture-handler` — animated counters, transitions, the
  unlock → dashboard reveal, and the payment success checkmark
- `react-native-svg` — the revenue chart (hand-rolled, not a chart library)
- `expo-camera` / `expo-image-picker` — receipt scanning on projects
- `expo-notifications` — push notifications, with an in-app foreground toast

## Project layout

```
src/
  app/                    Expo Router routes
    (auth)/                 login, signup
    (freelancer)/            dashboard, clients, invoices, projects, settings
    (client)/                home, invoices (+ pay), messages, settings
    enable-biometric.tsx    one-time post-login prompt
    _layout.tsx             providers, biometric lock overlay
  components/             shared UI (cards, badges, charts, message thread, ...)
  contexts/               auth, app-lock (biometric), notification toast
  hooks/                  use-cached-query (offline-aware fetch), theme
  lib/                    supabase client, queries, storage, payments, notifications
  animations/easing.ts    shared easing/duration/spring tokens
  types/database.ts       row types matching db/schema.sql
db/
  schema.sql              tables, RLS policies, triggers, storage bucket + policies
  migrations/              incremental changes to apply to an already-running project
scripts/
  seed.ts                 seeds one demo freelancer, 4 clients, projects, invoices, messages
supabase/functions/
  push-notify/             sends push on invoice-paid / new-message (Database Webhooks)
  simulate-payment/        the only place an invoice flips to `paid` (called from the app, no processor)
```

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`db/schema.sql`](db/schema.sql) — this creates every table, the RLS
   policies, the `handle_new_user` signup trigger, the activity-feed triggers, and the `attachments`
   storage bucket + its policies.
   - Already ran an older version of this schema? Run whichever of
     [`db/migrations`](db/migrations) you haven't applied yet, in order — `002` swaps the original
     Stripe field for Flutterwave's, `003` renames those to the processor-neutral `payment_ref` /
     `payment_transaction_id` used now that payments are simulated.
3. Under **Database → Replication**, confirm `activity_events`, `messages`, and `invoices` are in the
   `supabase_realtime` publication (the schema script adds them, but double-check).
4. Copy your project URL and anon key into `.env` (copy `.env.example` first).

### 2. App environment

```bash
cp .env.example .env
# fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY,
# and SUPABASE_SERVICE_ROLE_KEY (seed script only)
```

```bash
npm install
npx expo start
```

### 3. Seed demo data

```bash
npm run seed
```

Creates one demo freelancer (`demo@ledgerapp.dev`), 4 fake clients, 3 projects with milestones, a
message thread, and 8 invoices spread across draft/sent/paid/overdue. The app's "Continue as demo
freelancer" login button uses this account. The seed script needs `SUPABASE_SERVICE_ROLE_KEY` (it
bypasses RLS) — never ship that key in the app itself, only use it locally / in CI.

### 4. Payments — simulated

Neither Stripe nor Flutterwave support account creation from this project's target market (Tanzania),
so invoice payments are simulated end-to-end instead of running through any real processor. The UI,
animation, and data flow all work exactly as if a real payment happened — only the money-movement
call is mocked:

1. Tap **Pay** on the client invoice screen → a card-entry screen (number, expiry, CVC, name —
   cosmetic only, no real validation against a card network). See
   [`(client)/invoices/[id]/pay.tsx`](<src/app/(client)/invoices/[id]/pay.tsx>).
2. On submit, an artificial 1.5–2.5s "Processing…" delay runs client-side
   ([`use-simulated-payment.ts`](src/hooks/use-simulated-payment.ts)) — this is what makes it feel
   real instead of instant.
3. The outcome is decided client-side too: a card number ending in `0000` always declines; otherwise
   there's a random ~1-in-6 chance of a simulated decline, to exercise both UX paths. No card data is
   ever sent anywhere in either case.
4. Only on a simulated **success** does anything hit the network: the app calls the `simulate-payment`
   Edge Function, which is the one part of this flow that's genuinely real — an authenticated,
   server-side write of `invoices.status = 'paid'` (clients have no UPDATE grant on `invoices` under
   RLS, so this can't happen client-side, exactly like a real payment integration would enforce).
5. That update fires the existing `push-notify` webhook and activity feed exactly as before, and the
   app shows the same success checkmark + haptic feedback originally spec'd for a real payment sheet.

Setup — one function, no secrets, no third-party account needed:

```bash
supabase functions deploy simulate-payment
```

**Swapping in a real processor later**: the architecture — Edge Functions, the `payment_ref` /
`payment_transaction_id` invoice fields, RLS keeping payment writes server-side, the realtime/push
pipeline reacting to `invoices.status` — is exactly what a real Stripe/Flutterwave/local-gateway
integration would also need. Only `simulate-payment`'s body (and the client-side decision step in
`use-simulated-payment.ts`) would need to become a real API call; nothing downstream changes. Worth
being upfront about this being simulated in any write-up of this project — it's an honest framing,
and the parts that are real (UX, data flow, realtime sync) are still real.

### 5. Push notifications

```bash
supabase functions deploy push-notify
```

Then, in the Supabase dashboard under **Database → Webhooks**, create two webhooks pointing at the
`push-notify` function URL: one on `invoices` (UPDATE), one on `messages` (INSERT). The function
figures out the recipient and sends via Expo's push API — no extra secrets needed beyond the
service-role key Supabase injects automatically.

Push tokens only register on a physical device (not the simulator/emulator) and require an
[EAS project ID](https://docs.expo.dev/push-notifications/push-notifications-setup/) once you build
with EAS.

## Notes on what's stubbed

- **Payments**: simulated end-to-end, deliberately — see [Payments](#4-payments--simulated) above for
  why and what a real integration would change.
- **Subscriptions**: the `subscriptions` table and the Free/Pro plan display in Settings are wired up
  for reads; the "Upgrade" button is a placeholder — left out of scope for the payments work.
- **Deliverable attachments**: the upload path (camera/library → Supabase Storage) is shared between
  receipts and deliverables; the project Files tab currently only exposes the receipt-scan flow from
  the freelancer side.
