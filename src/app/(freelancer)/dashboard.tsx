import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line as SvgLine } from 'react-native-svg';

import { ActivityFeed } from '@/components/activity-feed';
import { AnimatedCounter } from '@/components/animated-counter';
import { ClientBalanceCarousel } from '@/components/dashboard/client-balance-carousel';
import { DashboardInvoiceRow } from '@/components/dashboard/dashboard-invoice-row';
import { WeekDayStrip } from '@/components/dashboard/week-day-strip';
import { GlowBackground } from '@/components/glow-background';
import { IcoBell, IcoCheck, IcoEye, IcoEyeOff, IcoFilter, IcoSearch } from '@/components/icons';
import { OfflineBanner } from '@/components/offline-banner';
import { PrimaryButton } from '@/components/primary-button';
import { RevenueChart } from '@/components/revenue-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import type { ShadowPreset } from '@/theme/tokens';
import { daysUntil, formatCurrency, getCurrencySymbol } from '@/lib/format';
import { getDashboardSummary, getOverdueInvoices, getUpcomingInvoices } from '@/lib/queries';
import { sendPaymentReminders, summarizeReminderResults } from '@/lib/reminders';

// Decorative gradient stop for the header avatar only — not a theme token,
// matching the "always this specific look" treatment used elsewhere (e.g.
// the virtual card mockup) for a one-off decorative element.
const AVATAR_GRADIENT_DIM = '#92610a';

// Deep ember stop for the balance card's gradient — paired with theme.primary
// so the card is the one place the accent gets to be this vivid, everywhere
// else (buttons, tab bar) stays neutral by design.
const BALANCE_CARD_GRADIENT_DEEP = '#4a1c0f';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const theme = useTheme();
  const { radius, fonts, fontSize, cardShadow, shadows } = useThemeTokens();
  const [showSearch, setShowSearch] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [query, setQuery] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const freelancerId = profile?.id ?? '';

  const currency = profile?.default_currency ?? 'usd';
  const currencySymbol = getCurrencySymbol(currency);

  const { data, isLoading, isOffline, refetch } = useCachedQuery(
    `dashboard-summary:${freelancerId}:${currency}`,
    () => getDashboardSummary(freelancerId, currency)
  );
  const { data: upcomingInvoices } = useCachedQuery(`upcoming-invoices:${freelancerId}`, () => getUpcomingInvoices(freelancerId, 5));

  const visibleInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (upcomingInvoices ?? []).filter((inv) => {
      if (overdueOnly && inv.status !== 'overdue') return false;
      if (q && !(inv.client?.name ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [upcomingInvoices, query, overdueOnly]);

  const { todayInvoices, laterInvoices } = useMemo(() => {
    const isUrgent = (inv: (typeof visibleInvoices)[number]) => {
      if (inv.status === 'overdue') return true;
      const days = daysUntil(inv.due_date);
      return days !== null && days <= 3;
    };
    return { todayInvoices: visibleInvoices.filter(isUrgent), laterInvoices: visibleInvoices.filter((inv) => !isUrgent(inv)) };
  }, [visibleInvoices]);

  const revenueChange = useMemo(() => {
    const months = data?.revenueByMonth ?? [];
    const last = months[months.length - 1]?.total ?? 0;
    const prev = months[months.length - 2]?.total ?? 0;
    if (prev <= 0) return null;
    return ((last - prev) / prev) * 100;
  }, [data?.revenueByMonth]);

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const overdue = await getOverdueInvoices(freelancerId);
      const results = await sendPaymentReminders(overdue);
      Alert.alert('Payment reminders', summarizeReminderResults(results));
    } catch (err) {
      Alert.alert('Could not send reminders', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSendingReminders(false);
    }
  };

  if (!profile) return null;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <GlowBackground height={360} cy="-2%" r="70%" />
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
          <View style={styles.header}>
            <LinearGradient
              colors={[theme.primary, AVATAR_GRADIENT_DIM]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.avatar,
                {
                  borderColor: `${theme.primary}40`,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                },
              ]}
            >
              <ThemedText style={{ fontFamily: fonts.display, fontSize: 17, color: theme.background }}>
                {profile.name.charAt(0).toUpperCase()}
              </ThemedText>
            </LinearGradient>
            <View style={styles.headerText}>
              <ThemedText type="label" themeColor="textSecondary" style={styles.welcomeLabel}>
                Welcome back
              </ThemedText>
              <ThemedText style={{ fontFamily: fonts.display, fontSize: 20, color: theme.text }}>{profile.name}</ThemedText>
            </View>
            <Pressable
              onPress={() => setShowSearch((v) => !v)}
              style={[styles.iconButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
            >
              <IcoSearch color={theme.textSecondary} size={18} />
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/(freelancer)/invoices', params: { status: 'overdue' } })}
              style={[styles.iconButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
            >
              <IcoBell color={theme.textSecondary} size={18} />
              {(data?.overdueInvoiceCount ?? 0) > 0 ? (
                <View style={[styles.bellDot, { backgroundColor: theme.danger, borderColor: theme.background }]} />
              ) : null}
            </Pressable>
          </View>

          {showSearch ? (
            <View style={styles.searchWrap}>
              <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <IcoSearch color={theme.textSecondary} size={16} />
                <TextInput
                  autoFocus
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search invoices, clients..."
                  placeholderTextColor={theme.textSecondary}
                  style={{ flex: 1, fontSize: fontSize.small, color: theme.text, fontFamily: fonts.sans }}
                />
                <Pressable onPress={() => setOverdueOnly((v) => !v)} hitSlop={8}>
                  <IcoFilter color={overdueOnly ? theme.primary : theme.textSecondary} size={16} />
                </Pressable>
              </View>
              {overdueOnly ? (
                <ThemedText type="code" themeColor="primary" style={styles.filterHint}>
                  Showing overdue only
                </ThemedText>
              ) : null}
            </View>
          ) : null}

          <OfflineBanner visible={isOffline} />

          <View style={styles.heroWrap}>
            <View style={[styles.heroCard, { borderRadius: radius.card }, cardShadowStyle(shadows.virtualCard)]}>
              <LinearGradient
                colors={[theme.primary, BALANCE_CARD_GRADIENT_DEEP]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.heroCardGradient, { borderRadius: radius.card }]}
              >
                <View style={styles.heroHeaderRow}>
                  <ThemedText type="label" style={styles.heroLabel}>
                    Outstanding Balance
                  </ThemedText>
                  <Pressable onPress={() => setBalanceHidden((v) => !v)} hitSlop={10}>
                    {balanceHidden ? <IcoEyeOff color="#FFFFFFB3" size={16} /> : <IcoEye color="#FFFFFFB3" size={16} />}
                  </Pressable>
                </View>
                <View style={styles.heroAmountRow}>
                  {balanceHidden ? (
                    <ThemedText type="hero" style={styles.heroAmount}>
                      ••••••
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText style={{ fontFamily: fonts.display, fontSize: 18, color: '#FFFFFF', marginTop: 10 }}>{currencySymbol}</ThemedText>
                      <AnimatedCounter
                        value={data?.outstandingTotal ?? 0}
                        formatter={(n) => Math.round(n).toLocaleString('en-US')}
                        type="hero"
                        style={styles.heroAmount}
                      />
                    </>
                  )}
                </View>
                <View style={styles.heroMetaRow}>
                  <View style={[styles.invoiceCountPill, { backgroundColor: '#FFFFFF26', borderRadius: radius.pill }]}>
                    <ThemedText type="code" style={styles.heroMetaText}>
                      {data?.outstandingInvoiceCount ?? 0} invoices
                    </ThemedText>
                  </View>
                  <ThemedText type="small" style={styles.heroMetaSubtext}>
                    across {data?.outstandingClientCount ?? 0} clients
                  </ThemedText>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.weekWrap}>
            <WeekDayStrip />
          </View>

          {visibleInvoices.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="smallBold">Client Balances</ThemedText>
                <Pressable onPress={() => router.push('/(freelancer)/clients')}>
                  <ThemedText type="small" themeColor="primary">
                    View all
                  </ThemedText>
                </Pressable>
              </View>
              <ClientBalanceCarousel invoices={visibleInvoices.slice(0, 3)} />
            </View>
          ) : query || overdueOnly ? (
            <View style={styles.section}>
              <ThemedText type="small" themeColor="textSecondary">
                No matching invoices.
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card }, cardShadowStyle(cardShadow)]}>
              <ThemedText type="label" themeColor="textSecondary" style={styles.statLabel}>
                Active Projects
              </ThemedText>
              <View style={styles.statValueRow}>
                <AnimatedCounter value={data?.activeProjectCount ?? 0} style={{ fontFamily: fonts.displayHeavy, fontSize: 44, color: theme.text }} />
                <View style={[styles.statIconWrap, { backgroundColor: theme.warningBg, borderRadius: 10 }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24">
                    <SvgLine x1={3} y1={6} x2={21} y2={6} stroke={theme.primary} strokeWidth={2.2} strokeLinecap="round" />
                    <SvgLine x1={3} y1={12} x2={21} y2={12} stroke={theme.primary} strokeWidth={2.2} strokeLinecap="round" />
                    <SvgLine x1={3} y1={18} x2={15} y2={18} stroke={theme.primary} strokeWidth={2.2} strokeLinecap="round" />
                  </Svg>
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.statFootnote}>
                {data?.activeProjectCount ?? 0} in progress
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card }, cardShadowStyle(cardShadow)]}>
              <ThemedText type="label" themeColor="textSecondary" style={styles.statLabel}>
                Paid This Month
              </ThemedText>
              <View style={styles.statValueRow}>
                <AnimatedCounter
                  value={data?.paidThisMonth ?? 0}
                  formatter={(n) => formatCurrency(n, currency)}
                  style={{ fontFamily: fonts.displayHeavy, fontSize: 26, letterSpacing: -0.3, color: theme.success }}
                />
                <View style={[styles.statIconWrap, { backgroundColor: theme.successBg, borderRadius: 10 }]}>
                  <IcoCheck color={theme.success} size={14} />
                </View>
              </View>
              <ThemedText type="small" themeColor="success" style={styles.statFootnote}>
                This month
              </ThemedText>
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card }, cardShadowStyle(cardShadow)]}>
            <View style={styles.chartHeaderRow}>
              <View>
                <ThemedText type="label" themeColor="textSecondary" style={styles.chartLabel}>
                  Revenue
                </ThemedText>
                <ThemedText style={{ fontFamily: fonts.display, fontSize: 18, color: theme.text }}>Last 6 Months</ThemedText>
              </View>
              {revenueChange !== null ? (
                <View style={[styles.changePill, { backgroundColor: theme.successBg, borderRadius: radius.pill }]}>
                  <ThemedText type="code" themeColor="success">
                    {revenueChange >= 0 ? '+' : ''}
                    {revenueChange.toFixed(1)}%
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <RevenueChart data={data?.revenueByMonth ?? []} />
          </View>

          {todayInvoices.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
                  Today
                </ThemedText>
                <Pressable onPress={() => router.push('/(freelancer)/invoices')}>
                  <ThemedText type="small" themeColor="primary">
                    See All
                  </ThemedText>
                </Pressable>
              </View>
              <View style={styles.rowList}>
                {todayInvoices.map((inv) => (
                  <DashboardInvoiceRow key={inv.id} invoice={inv} />
                ))}
              </View>
            </View>
          ) : null}

          {laterInvoices.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
                Upcoming
              </ThemedText>
              <View style={styles.rowList}>
                {laterInvoices.map((inv) => (
                  <DashboardInvoiceRow key={inv.id} invoice={inv} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.ctaWrap}>
            <PrimaryButton label="Send Payment Reminders" onPress={handleSendReminders} loading={sendingReminders} />
          </View>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Recent activity
          </ThemedText>
          <ActivityFeed freelancerId={freelancerId} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function cardShadowStyle(cardShadow: ShadowPreset) {
  return {
    shadowColor: cardShadow.color,
    shadowOffset: cardShadow.offset,
    shadowOpacity: cardShadow.opacity,
    shadowRadius: cardShadow.radius,
    elevation: cardShadow.elevation,
  };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  headerText: {
    flex: 1,
  },
  welcomeLabel: {
    marginBottom: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterHint: {
    marginTop: 8,
  },
  heroWrap: {
    paddingHorizontal: 20,
  },
  heroCard: {
    overflow: 'hidden',
  },
  heroCardGradient: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  heroLabel: {
    color: '#FFFFFFB3',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
  },
  heroAmount: {
    color: '#FFFFFF',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  heroMetaText: {
    color: '#FFFFFF',
  },
  heroMetaSubtext: {
    color: '#FFFFFFB3',
  },
  invoiceCountPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  weekWrap: {
    marginTop: 18,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionEyebrow: {
    marginBottom: 10,
  },
  rowList: {
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statLabel: {
    marginBottom: 10,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statIconWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statFootnote: {
    marginTop: 6,
  },
  chartCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartLabel: {
    marginBottom: 3,
  },
  changePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ctaWrap: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
});
