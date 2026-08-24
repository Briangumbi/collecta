import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ClientPicker } from '@/components/client-picker';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { createProject, getClients } from '@/lib/queries';
import type { Profile } from '@/types/database';

export default function NewProjectScreen() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Profile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getClients(profile.id).then(setClients);
  }, [profile]);

  const submit = async () => {
    if (!profile || !selectedClientId || !title.trim()) {
      setError('Choose a client and enter a project title.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createProject({ freelancerId: profile.id, clientId: selectedClientId, title: title.trim() });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          Client
        </ThemedText>
        <ClientPicker clients={clients} selectedId={selectedClientId} onSelect={setSelectedClientId} />

        <TextField label="Project title" value={title} onChangeText={setTitle} placeholder="Website Redesign" />

        {error ? (
          <ThemedText type="small" themeColor="danger" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <PrimaryButton label="Create project" onPress={submit} loading={submitting} />
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
  label: {
    marginBottom: 8,
  },
  error: {
    marginBottom: 12,
  },
});
