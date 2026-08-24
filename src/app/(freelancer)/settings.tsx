import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { SettingsToggleRow } from '@/components/settings-row';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppLock } from '@/contexts/app-lock-context';
import { useAuth } from '@/contexts/auth-context';
import { getSubscription } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/types/database';

export default function FreelancerSettingsScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const { isBiometricSupported, isBiometricEnabled, enableBiometric, disableBiometric } = useAppLock();
  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (profile) getSubscription(profile.id).then(setSubscription);
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
          <Avatar name={profile.name} url={profile.avatar_url} size={72} />
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
            description={isBiometricSupported ? 'Require Face ID / Touch ID to open Ledger' : 'Not available on this device'}
            value={isBiometricEnabled}
            onValueChange={handleBiometricToggle}
            disabled={!isBiometricSupported}
          />
        </Card>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Plan
        </ThemedText>
        <Card style={styles.card}>
          <View style={styles.planRow}>
            <View>
              <ThemedText type="default" style={styles.planName}>
                {subscription?.plan === 'pro' ? 'Pro' : 'Free'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {subscription?.plan === 'pro' ? 'Unlimited clients & invoices' : 'Up to 3 active clients'}
              </ThemedText>
            </View>
            {subscription?.plan !== 'pro' ? <PrimaryButton label="Upgrade" onPress={() => {}} /> : null}
          </View>
        </Card>

        <PrimaryButton label="Log out" variant="secondary" onPress={signOut} />
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
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    marginBottom: 2,
  },
});
