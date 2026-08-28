import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlowBackground } from '@/components/glow-background';
import { LogoMark } from '@/components/logo-mark';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const { signIn, signInAsDemo } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
  };

  const handleDemo = async () => {
    setError(null);
    setDemoLoading(true);
    const { error } = await signInAsDemo();
    setDemoLoading(false);
    if (error) setError(error);
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <GlowBackground width={420} height={320} cx="30%" cy="0%" r="55%" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.markWrap}>
              <LogoMark size={56} />
            </View>
            <ThemedText type="title" style={styles.title}>
              Collecta
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
              Client management and billing, built for freelancers.
            </ThemedText>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@studio.com"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              placeholder="••••••••"
            />

            {error ? (
              <ThemedText type="small" themeColor="danger" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton label="Log in" onPress={handleSignIn} loading={loading} disabled={!email || !password} />

            <View style={styles.forgotRow}>
              <Link href="/(auth)/forgot-password">
                <ThemedText type="small" themeColor="primary">
                  Forgot password?
                </ThemedText>
              </Link>
            </View>

            <View style={styles.signupRow}>
              <ThemedText type="small" themeColor="textSecondary">
                No account?{' '}
              </ThemedText>
              <Link href="/(auth)/signup">
                <ThemedText type="link" themeColor="primary">
                  Sign up
                </ThemedText>
              </Link>
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.dividerLabel}>
                or
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <PrimaryButton
              label="Continue as demo freelancer"
              variant="secondary"
              onPress={handleDemo}
              loading={demoLoading}
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.demoHint}>
              Explore a fully seeded portfolio account — clients, invoices, and projects included.
            </ThemedText>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 24,
    paddingTop: 48,
  },
  markWrap: {
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    marginBottom: 6,
  },
  subtitle: {
    marginBottom: 32,
  },
  error: {
    marginBottom: 12,
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLabel: {
    marginHorizontal: 12,
  },
  demoHint: {
    marginTop: 10,
    textAlign: 'center',
  },
});
