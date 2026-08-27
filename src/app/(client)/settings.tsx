import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { DeleteAccountSection } from '@/components/delete-account-section';
import { IcoChevronRight } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { SettingsToggleRow } from '@/components/settings-row';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppLock } from '@/contexts/app-lock-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { getClientInvoices, getClientProjects } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

export default function ClientSettingsScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const theme = useTheme();
  const { isBiometricSupported, isBiometricEnabled, enableBiometric, disableBiometric } = useAppLock();
  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [counts, setCounts] = useState<{ projects: number; invoices: number } | null>(null);

  useEffect(() => {
    if (!profile) return;
    Promise.all([getClientProjects(profile.id), getClientInvoices(profile.id)]).then(([projects, invoices]) =>
      setCounts({ projects: projects.length, invoices: invoices.length })
    );
  }, [profile]);

  if (!profile) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ name: name.trim() }).eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const { error } = await enableBiometric();
      if (error) Alert.alert('Could not enable', error);
    } else {
      await disableBiometric();
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={profile.name} size={72} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.email}>
            {profile.email}
          </ThemedText>
        </View>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Profile
        </ThemedText>
        <Card style={styles.card}>
          <TextField label="Name" value={name} onChangeText={setName} />
          <PrimaryButton label="Save changes" onPress={handleSaveProfile} loading={saving} />
        </Card>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Security
        </ThemedText>
        <Card style={styles.card}>
          <SettingsToggleRow
            label="Biometric unlock"
            description={isBiometricSupported ? 'Require Face ID / Touch ID to open Collecta' : 'Not available on this device'}
            value={isBiometricEnabled}
            onValueChange={handleBiometricToggle}
            disabled={!isBiometricSupported}
          />
        </Card>

        <PrimaryButton label="Log out" variant="secondary" onPress={signOut} />

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Privacy & Data
        </ThemedText>
        <Card style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            Collecta stores your profile, plus {counts ? `${counts.projects} project${counts.projects === 1 ? '' : 's'} and ${counts.invoices} invoice${counts.invoices === 1 ? '' : 's'}` : 'your projects and invoices'} shared with your freelancer — all scoped to your account under row-level security.
          </ThemedText>
        </Card>
        <DeleteAccountSection warning="This removes your profile and message history, and removes you from your freelancer’s projects and invoices." />

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Legal
        </ThemedText>
        <Card style={styles.card}>
          <Pressable style={styles.legalRow} onPress={() => router.push('/privacy-policy')}>
            <ThemedText type="default">Privacy Policy</ThemedText>
            <IcoChevronRight color={theme.border} size={14} />
          </Pressable>
          <View style={[styles.legalDivider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.legalRow} onPress={() => router.push('/terms')}>
            <ThemedText type="default">Terms of Service</ThemedText>
            <IcoChevronRight color={theme.border} size={14} />
          </Pressable>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  email: {
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 24,
    gap: 4,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  legalDivider: {
    height: StyleSheet.hairlineWidth,
  },
});
