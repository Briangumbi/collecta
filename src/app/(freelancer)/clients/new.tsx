import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createClientAccount } from '@/lib/queries';

export default function NewClientScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email.trim());

  const handleSubmit = async () => {
    if (!isValid) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await createClientAccount(name.trim(), email.trim());
      if (result.isNewAccount && result.tempPassword) {
        Alert.alert(
          'Client added',
          `${name.trim()} now has a Collecta account.\n\nEmail: ${email.trim()}\nTemporary password: ${result.tempPassword}\n\nShare this with them so they can log in — they can change it once signed in.`,
          [{ text: 'Done', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Client added', `${name.trim()} already had a Collecta account and is now linked to you.`, [
          { text: 'Done', onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add client.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.intro}>
          Enter your client’s details. If they don’t have a Collecta account yet, we’ll create one and give you a
          temporary password to share with them.
        </ThemedText>

        <TextField label="Client name" value={name} onChangeText={setName} placeholder="Jane Whitfield" autoCapitalize="words" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="jane@studio.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />

        {error ? (
          <ThemedText type="small" themeColor="danger" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <PrimaryButton label="Add client" onPress={handleSubmit} loading={submitting} disabled={!isValid} />
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
  intro: {
    marginBottom: 20,
    lineHeight: 19,
  },
  error: {
    marginBottom: 12,
  },
});
