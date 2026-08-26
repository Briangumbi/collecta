import { Redirect } from 'expo-router';

import { useAppLock } from '@/contexts/app-lock-context';
import { useAuth } from '@/contexts/auth-context';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function Index() {
  const { session, profile } = useAuth();
  const { isReady, isBiometricSupported, isBiometricEnabled, hasPromptedBiometric } = useAppLock();
  const { hasSeenOnboarding } = useOnboarding();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!profile || !isReady || hasSeenOnboarding === null) return null;

  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;

  if (isBiometricSupported && !isBiometricEnabled && !hasPromptedBiometric) {
    return <Redirect href="/enable-biometric" />;
  }

  if (profile.role === 'freelancer') return <Redirect href="/(freelancer)/dashboard" />;
  return <Redirect href="/(client)/home" />;
}
