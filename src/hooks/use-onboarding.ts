import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const ONBOARDING_SEEN_KEY = 'ledger.onboarding_seen';

/**
 * Device-local, one-time flag — same pattern as app-lock-context's
 * hasPromptedBiometric. `null` while still loading, so index.tsx can hold
 * off routing until it's known either way.
 */
export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY).then((v) => setHasSeenOnboarding(v === 'true'));
  }, []);

  const markOnboardingSeen = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setHasSeenOnboarding(true);
  };

  return { hasSeenOnboarding, markOnboardingSeen };
}
