import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEMO_FREELANCER_EMAIL, DEMO_FREELANCER_PASSWORD } from '@/lib/demo';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  /** True once a password-recovery deep link has established a session — routing should
   *  send the user straight to /reset-password instead of the normal post-login flow. */
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role: 'freelancer' | 'client') => Promise<{ error: string | null }>;
  signInAsDemo: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Supabase never reveals whether the email exists — the caller should show the same
   *  "check your email" message regardless of the result, to avoid leaking account existence. */
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  /** Called once the new password is saved, so routing falls back to the normal post-login flow. */
  completePasswordRecovery: () => void;
}

/** Supabase's recovery link redirects here with a single-use PKCE code (see the
 *  flowType note in lib/supabase.ts), e.g. `collecta://reset-password?code=…&type=recovery`. */
function parseRecoveryCode(url: string) {
  const paramString = url.split('#')[1] ?? url.split('?')[1] ?? '';
  const params = new URLSearchParams(paramString);
  return { code: params.get('code'), type: params.get('type') };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) {
      setProfile(data as Profile);
      return true;
    }
    setProfile(null);
    return false;
  };

  useEffect(() => {
    let mounted = true;

    // A stored session can outlive the account it points to (e.g. deleted from
    // another device, or a revoked/expired token) — the JWT still looks valid
    // locally, but there's no profile row to route on. Sign out rather than
    // getting stuck with a session and no profile, which would otherwise leave
    // index.tsx waiting forever and render a blank screen.
    const applySession = async (nextSession: Session | null) => {
      if (nextSession) {
        const ok = await fetchProfile(nextSession.user.id);
        if (!mounted) return;
        if (!ok) {
          await supabase.auth.signOut();
          return;
        }
      } else {
        setProfile(null);
      }
      setSession(nextSession);
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      await applySession(data.session);
      if (mounted) setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      await applySession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // detectSessionInUrl is off (see lib/supabase.ts — this app has no server to run the
    // browser-only auto-detect against), so the recovery link's code is picked up here
    // instead: whichever way the deep link arrives (cold start vs already running).
    // exchangeCodeForSession verifies the code against the PKCE verifier stashed locally
    // (via the same AsyncStorage-backed `storage` the client already uses) when
    // sendPasswordReset originally requested it — a code with no matching local verifier
    // (e.g. replayed, or opened on a different device) is rejected server-side.
    const handleUrl = async (url: string) => {
      const { code, type } = parseRecoveryCode(url);
      if (type !== 'recovery' || !code) return;
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) setIsPasswordRecovery(true);
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInAsDemo = async () => signIn(DEMO_FREELANCER_EMAIL, DEMO_FREELANCER_PASSWORD);

  const signUp = async (email: string, password: string, name: string, role: 'freelancer' | 'client') => {
    // Profile row is created server-side by the `on_auth_user_created` trigger
    // (see db/schema.sql), reading `name`/`role` back out of this metadata.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign up failed. Please try again.' };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (session?.user.id) await fetchProfile(session.user.id);
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('reset-password'),
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  };

  const completePasswordRecovery = () => setIsPasswordRecovery(false);

  // signIn/signUp/signOut/signInAsDemo/refreshProfile/sendPasswordReset/updatePassword/
  // completePasswordRecovery close only over `session` (already a dep) and stable module-level
  // calls, so they're intentionally left out — including them would just make `value` a new
  // object on every render, defeating the memo.
  const value = useMemo(
    () => ({
      session,
      profile,
      isLoading,
      isPasswordRecovery,
      signIn,
      signUp,
      signInAsDemo,
      signOut,
      refreshProfile,
      sendPasswordReset,
      updatePassword,
      completePasswordRecovery,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, profile, isLoading, isPasswordRecovery]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
