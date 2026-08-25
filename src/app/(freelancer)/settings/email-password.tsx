import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

export default function EmailPasswordScreen() {
  const { profile } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleChangeEmail = async () => {
    const email = newEmail.trim();
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    setEmailSaving(true);
    const { error } = await supabase.auth.updateUser({ email });
    setEmailSaving(false);
    if (error) {
      Alert.alert('Could not update email', error.message);
      return;
    }
    setNewEmail('');
    Alert.alert('Confirm your new email', `Check ${email} for a confirmation link — your email won't change until you confirm it.`);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Make sure both fields match.');
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      Alert.alert('Could not update password', error.message);
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Password updated', 'Your password has been changed.');
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Email
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.currentValue}>
          Current: {profile?.email}
        </ThemedText>
        <TextField
          label="New email"
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="you@studio.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <PrimaryButton label="Update email" onPress={handleChangeEmail} loading={emailSaving} disabled={!newEmail.trim()} />

        <View style={styles.divider} />

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Password
        </ThemedText>
        <TextField label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 6 characters" />
        <TextField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Repeat password" />
        <PrimaryButton
          label="Update password"
          onPress={handleChangePassword}
          loading={passwordSaving}
          disabled={!newPassword || !confirmPassword}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  currentValue: {
    marginBottom: 16,
  },
  divider: {
    height: 32,
  },
});
