import { Redirect } from 'expo-router';

import { useAppLock } from '@/contexts/app-lock-context';
import { useAuth } from '@/contexts/auth-context';

export default function Index() {
  const { session, profile } = useAuth();
  const { isReady, isBiometricSupported, isBiometricEnabled, hasPromptedBiometric } = useAppLock();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!profile || !isReady) return null;

  if (isBiometricSupported && !isBiometricEnabled && !hasPromptedBiometric) {
    return <Redirect href="/enable-biometric" />;
  }

  if (profile.role === 'freelancer') return <Redirect href="/(freelancer)/dashboard" />;
  return <Redirect href="/(client)/home" />;
}
