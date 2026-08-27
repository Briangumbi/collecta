import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

// Face ID / Touch ID has no web equivalent, and Collecta targets iOS/Android —
// this subsystem is a no-op on web rather than depending on expo-secure-store's
// web shim.
const BIOMETRICS_AVAILABLE = Platform.OS !== 'web';

const BIOMETRIC_PREF_KEY = 'collecta.biometric_enabled';
const BIOMETRIC_PROMPTED_KEY = 'collecta.biometric_prompted';

interface AppLockContextValue {
  isBiometricSupported: boolean;
  isBiometricEnabled: boolean;
  hasPromptedBiometric: boolean;
  isLocked: boolean;
  isReady: boolean;
  enableBiometric: () => Promise<{ error: string | null }>;
  disableBiometric: () => Promise<void>;
  unlock: () => Promise<{ success: boolean; error?: string }>;
  markBiometricPrompted: () => Promise<void>;
}

const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: { children: ReactNode }) {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [hasPromptedBiometric, setHasPromptedBiometric] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const appState = useRef(AppState.currentState);
  const biometricEnabledRef = useRef(false);

  useEffect(() => {
    if (!BIOMETRICS_AVAILABLE) {
      setIsReady(true);
      return;
    }
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(hasHardware && isEnrolled);

      const pref = await SecureStore.getItemAsync(BIOMETRIC_PREF_KEY);
      const enabled = pref === 'true';
      biometricEnabledRef.current = enabled;
      setIsBiometricEnabled(enabled);
      setIsLocked(enabled);

      const prompted = await SecureStore.getItemAsync(BIOMETRIC_PROMPTED_KEY);
      setHasPromptedBiometric(prompted === 'true');

      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      // Re-lock only on a real backgrounding, not the brief "inactive" blip
      // from control center / app switcher / camera permission sheets.
      if (appState.current === 'active' && nextState === 'background' && biometricEnabledRef.current) {
        setIsLocked(true);
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  const enableBiometric = async () => {
    if (!BIOMETRICS_AVAILABLE) return { error: 'Biometric unlock is not available on web.' };
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm to enable biometric unlock',
    });
    if (!result.success) return { error: 'Could not verify biometrics.' };
    await SecureStore.setItemAsync(BIOMETRIC_PREF_KEY, 'true');
    biometricEnabledRef.current = true;
    setIsBiometricEnabled(true);
    return { error: null };
  };

  const disableBiometric = async () => {
    await SecureStore.deleteItemAsync(BIOMETRIC_PREF_KEY);
    biometricEnabledRef.current = false;
    setIsBiometricEnabled(false);
    setIsLocked(false);
  };

  const unlock = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Collecta',
      cancelLabel: 'Cancel',
    });
    if (result.success) {
      setIsLocked(false);
      return { success: true };
    }
    return { success: false, error: 'error' in result ? String(result.error) : undefined };
  };

  const markBiometricPrompted = async () => {
    await SecureStore.setItemAsync(BIOMETRIC_PROMPTED_KEY, 'true');
    setHasPromptedBiometric(true);
  };

  const value = useMemo(
    () => ({
      isBiometricSupported,
      isBiometricEnabled,
      hasPromptedBiometric,
      isLocked,
      isReady,
      enableBiometric,
      disableBiometric,
      unlock,
      markBiometricPrompted,
    }),
    [isBiometricSupported, isBiometricEnabled, hasPromptedBiometric, isLocked, isReady]
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock() {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used within an AppLockProvider');
  return ctx;
}
