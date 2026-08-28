import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlowBackground } from '@/components/glow-background';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setError(null);
    setLoading(true);
    const { error } = await sendPasswordReset(email.trim());
    setLoading(false);
    // Show the same confirmation regardless of outcome — Supabase itself doesn't reveal
    // whether the email is registered, and neither should this screen.
    if (error) setError(error);
    else setSent(true);
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <GlowBackground width={420} height={320} cx="30%" cy="0%" r="55%" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={styles.title}>
              Reset password
            </ThemedText>

            {sent ? (
              <>
                <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
                  If an account exists for {email.trim()}, we’ve sent a link to reset your password.
                </ThemedText>
                <PrimaryButton label="Back to login" onPress={() => router.replace('/(auth)/login')} />
              </>
            ) : (
              <>
                <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
                  Enter the email on your account and we’ll send you a link to set a new password.
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

                {error ? (
                  <ThemedText type="small" themeColor="danger" style={styles.error}>
                    {error}
                  </ThemedText>
                ) : null}

                <PrimaryButton label="Send reset link" onPress={handleSend} loading={loading} disabled={!email} />

                <View style={styles.backRow}>
                  <Link href="/(auth)/login">
                    <ThemedText type="link" themeColor="primary">
                      Back to login
                    </ThemedText>
                  </Link>
                </View>
              </>
            )}
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
  backRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
