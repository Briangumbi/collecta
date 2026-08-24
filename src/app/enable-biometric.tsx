import * as LocalAuthentication from 'expo-local-authentication';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppLock } from '@/contexts/app-lock-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function EnableBiometricScreen() {
  const { session } = useAuth();
  const { enableBiometric, markBiometricPrompted } = useAppLock();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState('biometric unlock');

  useEffect(() => {
    LocalAuthentication.supportedAuthenticationTypesAsync().then((types) => {
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) setLabel('Face ID');
      else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) setLabel('Touch ID');
    });
  }, []);

  if (!session) return <Redirect href="/(auth)/login" />;

  const handleEnable = async () => {
    setError(null);
    setLoading(true);
    const { error } = await enableBiometric();
    await markBiometricPrompted();
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace('/');
  };

  const handleSkip = async () => {
    await markBiometricPrompted();
    router.replace('/');
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText style={styles.iconGlyph}>🔒</ThemedText>
          </View>
          <ThemedText type="title" style={styles.title}>
            Secure your account
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            Enable {label} to unlock Ledger instantly next time, without retyping your password.
          </ThemedText>
          {error ? (
            <ThemedText type="small" themeColor="danger" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}
          <View style={styles.buttons}>
            <PrimaryButton label={`Enable ${label}`} onPress={handleEnable} loading={loading} />
            <View style={styles.spacer} />
            <PrimaryButton label="Not now" variant="secondary" onPress={handleSkip} />
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconGlyph: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 36,
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
  },
  spacer: {
    height: 12,
  },
});
