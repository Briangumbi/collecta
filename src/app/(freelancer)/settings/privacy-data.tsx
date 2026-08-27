import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { DeleteAccountSection } from '@/components/delete-account-section';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { getClients, getInvoices, getProjects } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

export default function PrivacyDataScreen() {
  const { profile } = useAuth();
  const [counts, setCounts] = useState<{ clients: number; projects: number; invoices: number } | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);

  useEffect(() => {
    if (!profile) return;
    Promise.all([getClients(profile.id), getProjects(profile.id), getInvoices(profile.id)]).then(([clients, projects, invoices]) =>
      setCounts({ clients: clients.length, projects: projects.length, invoices: invoices.length })
    );
  }, [profile]);

  const handleSignOutAll = () => {
    Alert.alert('Sign out everywhere?', 'This ends every active session for your account, including this one.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out everywhere',
        style: 'destructive',
        onPress: async () => {
          setSigningOutAll(true);
          const { error } = await supabase.auth.signOut({ scope: 'global' });
          setSigningOutAll(false);
          if (error) Alert.alert('Could not sign out', error.message);
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          What Collecta stores about your business
        </ThemedText>
        {counts ? (
          <View style={styles.countRow}>
            <CountStat label="Clients" value={counts.clients} />
            <CountStat label="Projects" value={counts.projects} />
            <CountStat label="Invoices" value={counts.invoices} />
          </View>
        ) : (
          <ActivityIndicator style={styles.spinner} />
        )}
        <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
          Plus your profile details, project milestones, attachments, and message history — all scoped to your
          account under row-level security, so no other freelancer or client can read it.
        </ThemedText>

        <View style={styles.divider} />

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Sessions
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
          If you’ve signed in on a device you no longer use, you can end every active session at once.
        </ThemedText>
        <PrimaryButton
          label="Sign out of all devices"
          variant="secondary"
          onPress={handleSignOutAll}
          loading={signingOutAll}
        />

        <View style={styles.divider} />

        <DeleteAccountSection warning="This removes your profile, clients, projects, invoices, and messages permanently — your clients keep their own accounts, but you’ll lose your business records." />
      </ScrollView>
    </ThemedView>
  );
}

function CountStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.countStat}>
      <ThemedText type="title" style={styles.countValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
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
  countRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  countStat: {
    gap: 2,
  },
  countValue: {
    fontSize: 28,
    lineHeight: 32,
  },
  body: {
    lineHeight: 19,
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 32,
  },
});
