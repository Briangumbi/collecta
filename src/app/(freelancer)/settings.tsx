import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { GlowBackground } from '@/components/glow-background';
import { IcoChevronRight, IcoCreditCard, IcoMail, IcoUser } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { SettingsToggleRow } from '@/components/settings-row';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemePicker } from '@/components/theme-picker';
import { ToggleSwitch } from '@/components/toggle-switch';
import { useAppLock } from '@/contexts/app-lock-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { formatDate } from '@/lib/format';
import { getSubscription } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { PRO_PRICE_LABEL } from '@/app/upgrade';
import type { Subscription } from '@/types/database';

// Decorative gradient stop for the profile avatar — see Dashboard's header avatar for the same treatment.
const AVATAR_GRADIENT_DIM = '#92610a';

const PLAN_FEATURES = ['Unlimited invoices', 'Up to 20 clients', 'Revenue analytics', 'Custom branding'];

export default function FreelancerSettingsScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const { isBiometricSupported, isBiometricEnabled, enableBiometric, disableBiometric } = useAppLock();
  const theme = useTheme();
  const { radius, fonts, cardShadow } = useThemeTokens();
  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [notifications, setNotifications] = useState({
    invoicePaid: true,
    paymentReminders: true,
    weeklyReport: false,
    projectUpdates: true,
    marketing: false,
  });

  useFocusEffect(
    useCallback(() => {
      if (profile) getSubscription(profile.id).then(setSubscription);
    }, [profile])
  );

  if (!profile) return null;

  const isPro = subscription?.plan === 'pro';

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ name: name.trim() }).eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
    setEditingProfile(false);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const { error } = await enableBiometric();
      if (error) Alert.alert('Could not enable', error);
    } else {
      await disableBiometric();
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => (value: boolean) =>
    setNotifications((prev) => ({ ...prev, [key]: value }));

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground height={280} cy="-4%" r="70%" />
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Settings" />

        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.backgroundElement, borderRadius: radius.card + 4 },
            { shadowColor: cardShadow.color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: cardShadow.opacity * 1.2, shadowRadius: 30, elevation: 6 },
          ]}
        >
          <View style={styles.profileRow}>
            <LinearGradient
              colors={[theme.primary, AVATAR_GRADIENT_DIM]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.avatar, { borderColor: `${theme.primary}4D` }]}
            >
              <ThemedText style={{ fontFamily: fonts.display, fontSize: 26, color: theme.background }}>
                {profile.name.charAt(0).toUpperCase()}
              </ThemedText>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <ThemedText style={{ fontFamily: fonts.display, fontSize: 20, color: theme.text }} numberOfLines={1}>
                {profile.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {profile.email}
              </ThemedText>
              <View style={[styles.planPill, { backgroundColor: theme.warningBg, borderRadius: radius.pill }]}>
                <View style={[styles.planDot, { backgroundColor: theme.primary }]} />
                <ThemedText type="code" themeColor="primary">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </ThemedText>
              </View>
            </View>
          </View>

          {editingProfile ? (
            <View style={styles.editForm}>
              <TextField label="Name" value={name} onChangeText={setName} />
              <PrimaryButton label="Save changes" onPress={handleSaveProfile} loading={saving} />
            </View>
          ) : (
            <PillOutlineButton label="Edit Profile" icon={<IcoUser color={theme.primary} size={15} />} onPress={() => setEditingProfile(true)} />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
            Appearance
          </ThemedText>
          <ThemePicker />
        </View>

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
            Notifications
          </ThemedText>
          <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card }]}>
            <NotificationRow
              label="Invoice Paid"
              description="Alert when a client pays an invoice"
              value={notifications.invoicePaid}
              onValueChange={toggleNotification('invoicePaid')}
              divider
            />
            <NotificationRow
              label="Payment Reminders"
              description="Auto-reminders for overdue invoices"
              value={notifications.paymentReminders}
              onValueChange={toggleNotification('paymentReminders')}
              divider
            />
            <NotificationRow
              label="Weekly Report"
              description="Revenue summary every Monday"
              value={notifications.weeklyReport}
              onValueChange={toggleNotification('weeklyReport')}
              divider
            />
            <NotificationRow
              label="Project Updates"
              description="Alerts on project milestones"
              value={notifications.projectUpdates}
              onValueChange={toggleNotification('projectUpdates')}
              divider
            />
            <NotificationRow
              label="Marketing"
              description="Tips, updates and product news"
              value={notifications.marketing}
              onValueChange={toggleNotification('marketing')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
            Security
          </ThemedText>
          <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card, paddingHorizontal: 18 }]}>
            <SettingsToggleRow
              label="Biometric unlock"
              description={isBiometricSupported ? 'Require Face ID / Touch ID to open Ledger' : 'Not available on this device'}
              value={isBiometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!isBiometricSupported}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
            Subscription
          </ThemedText>
          <View
            style={[
              styles.planCard,
              { backgroundColor: theme.backgroundElement, borderRadius: radius.card },
              { shadowColor: cardShadow.color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: cardShadow.opacity, shadowRadius: 24, elevation: 5 },
            ]}
          >
            <View style={styles.planCardTop}>
              <View style={styles.planCardLeft}>
                <View style={styles.planTitleRow}>
                  <IcoCreditCard color={theme.primary} size={18} />
                  <ThemedText style={{ fontFamily: fonts.display, fontSize: 18, color: theme.text }}>{isPro ? 'Pro Plan' : 'Free Plan'}</ThemedText>
                </View>
                {isPro ? (
                  <>
                    <View style={styles.priceRow}>
                      <ThemedText style={{ fontFamily: fonts.displayHeavy, fontSize: 30, color: theme.primary }}>{PRO_PRICE_LABEL.split('/')[0]}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        / {PRO_PRICE_LABEL.split('/')[1]}
                      </ThemedText>
                    </View>
                    {subscription?.current_period_end ? (
                      <ThemedText type="code" themeColor="textSecondary" style={styles.renewsLabel}>
                        Renews {formatDate(subscription.current_period_end)}
                      </ThemedText>
                    ) : null}
                  </>
                ) : (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.renewsLabel}>
                    Up to 3 active clients
                  </ThemedText>
                )}
              </View>
              {!isPro ? <PillOutlineButtonSmall label="Upgrade" onPress={() => router.push('/upgrade')} /> : null}
            </View>
            {isPro ? (
              <View style={styles.featureList}>
                {PLAN_FEATURES.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <View style={[styles.featureDotWrap, { backgroundColor: theme.warningBg }]}>
                      <ThemedText type="code" themeColor="primary">
                        ✓
                      </ThemedText>
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      {f}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
            Account
          </ThemedText>
          <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card }]}>
            <AccountRow
              label="Email & Password"
              icon={<IcoMail color={theme.textSecondary} size={16} />}
              onPress={() => Alert.alert('Coming soon', 'Account settings aren’t wired up yet.')}
              divider
            />
            <AccountRow
              label="Privacy & Data"
              icon={<IcoUser color={theme.textSecondary} size={16} />}
              onPress={() => Alert.alert('Coming soon', 'Privacy settings aren’t wired up yet.')}
            />
          </View>
        </View>

        <PrimaryButton label="Log out" variant="secondary" onPress={signOut} />

        <ThemedText type="code" themeColor="textSecondary" style={styles.version}>
          Ledger · {new Date().getFullYear()}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

function NotificationRow({
  label,
  description,
  value,
  onValueChange,
  divider,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  divider?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.notificationRow, divider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
      <View style={styles.notificationText}>
        <ThemedText type="default">{label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      </View>
      <ToggleSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function AccountRow({ label, icon, onPress, divider }: { label: string; icon: React.ReactNode; onPress: () => void; divider?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.accountRow, divider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}
    >
      <View style={[styles.accountIcon, { backgroundColor: theme.warningBg }]}>{icon}</View>
      <ThemedText type="default" style={styles.accountLabel}>
        {label}
      </ThemedText>
      <IcoChevronRight color={theme.border} size={14} />
    </Pressable>
  );
}

function PillOutlineButton({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) {
  const theme = useTheme();
  const { radius } = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.editButton, { borderColor: theme.border, backgroundColor: theme.warningBg, borderRadius: radius.card - 8 }]}
    >
      {icon}
      <ThemedText type="smallBold" themeColor="primary">
        {label}
      </ThemedText>
    </Pressable>
  );
}

function PillOutlineButtonSmall({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  const { radius } = useThemeTokens();
  return (
    <Pressable onPress={onPress} style={[styles.upgradeButton, { backgroundColor: theme.primary, borderRadius: radius.pill }]}>
      <ThemedText type="smallBold" themeColor="primaryText">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingBottom: 140,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  planDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
  },
  editForm: {
    gap: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionEyebrow: {
    marginBottom: 12,
  },
  listCard: {
    overflow: 'hidden',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 18,
  },
  notificationText: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  planCard: {
    padding: 18,
  },
  planCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  planCardLeft: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  renewsLabel: {
    marginTop: 3,
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  featureList: {
    marginTop: 14,
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDotWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingHorizontal: 18,
  },
  accountIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountLabel: {
    flex: 1,
  },
  version: {
    textAlign: 'center',
    marginTop: 16,
  },
});
