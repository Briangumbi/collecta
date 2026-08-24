import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import type { UserRole } from '@/types/database';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('freelancer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim(), role);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace('/');
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={styles.title}>
              Create account
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
              Set up your Ledger workspace.
            </ThemedText>

            <View style={styles.roleRow}>
              <RoleOption label="I'm a freelancer" active={role === 'freelancer'} onPress={() => setRole('freelancer')} />
              <RoleOption label="I'm a client" active={role === 'client'} onPress={() => setRole('client')} />
            </View>

            <TextField label="Full name" value={name} onChangeText={setName} placeholder="Alex Rivera" />
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
              placeholder="At least 6 characters"
            />

            {error ? (
              <ThemedText type="small" themeColor="danger" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton
              label="Create account"
              onPress={handleSignUp}
              loading={loading}
              disabled={!email || !password || !name}
            />

            <View style={styles.loginRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Already have an account?{' '}
              </ThemedText>
              <Link href="/(auth)/login" replace>
                <ThemedText type="link" themeColor="primary">
                  Log in
                </ThemedText>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

function RoleOption({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roleOption,
        {
          borderColor: active ? theme.primary : theme.border,
          backgroundColor: active ? theme.backgroundSelected : theme.backgroundElement,
        },
      ]}
    >
      <ThemedText type="smallBold" themeColor={active ? 'primary' : 'text'}>
        {label}
      </ThemedText>
    </Pressable>
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
    marginBottom: 28,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  error: {
    marginBottom: 12,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});
