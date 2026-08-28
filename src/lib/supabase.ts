import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Note: intentionally untyped (no Database generic). supabase-js's generated-type
// plumbing needs the *exact* shape `supabase gen types` produces, which this project
// doesn't have (no live project to generate against). Query results are cast to the
// interfaces in `@/types/database` at the call site in `@/lib/queries` instead — swap
// in a generated Database type there once you've run `supabase gen types typescript`.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // PKCE rather than the implicit-flow default: the password-recovery deep link
    // (see auth-context.tsx) then carries a single-use `code` to exchange for a
    // session, not a raw access/refresh token pair sitting in the URL — which on
    // mobile can be intercepted by another app registered for the same URL scheme,
    // or linger in mail-client link previews/history. Doesn't affect direct
    // signIn/signUp calls, which never go through a redirect.
    flowType: 'pkce',
  },
});
