import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityFeed } from '@/components/activity-feed';
import { AnimatedCounter } from '@/components/animated-counter';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { OfflineBanner } from '@/components/offline-banner';
import { PrimaryButton } from '@/components/primary-button';
import { RevenueChart } from '@/components/revenue-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { formatCurrency } from '@/lib/format';
import { getDashboardSummary } from '@/lib/queries';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const freelancerId = profile?.id ?? '';

  const { data, isLoading, isOffline, refetch } = useCachedQuery(
    `dashboard-summary:${freelancerId}`,
    () => getDashboardSummary(freelancerId)
  );

  if (!profile) return null;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
          <View style={styles.header}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Welcome back
              </ThemedText>
              <ThemedText type="title" style={styles.headerName}>
                {profile.name.split(' ')[0]}
              </ThemedText>
            </View>
            <Avatar name={profile.name} url={profile.avatar_url} size={48} />
          </View>

          <OfflineBanner visible={isOffline} />

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <ThemedText type="small" themeColor="textSecondary">
                Outstanding
              </ThemedText>
              <AnimatedCounter
                value={data?.outstandingTotal ?? 0}
                formatter={(n) => formatCurrency(n)}
                type="subtitle"
                style={styles.statValue}
              />
            </Card>
            <Card style={styles.statCard}>
              <ThemedText type="small" themeColor="textSecondary">
                Active projects
              </ThemedText>
              <AnimatedCounter value={data?.activeProjectCount ?? 0} type="subtitle" style={styles.statValue} />
            </Card>
          </View>
          <Card style={styles.wideStatCard}>
            <ThemedText type="small" themeColor="textSecondary">
              Paid this month
            </ThemedText>
            <AnimatedCounter
              value={data?.paidThisMonth ?? 0}
              formatter={(n) => formatCurrency(n)}
              type="subtitle"
              style={styles.statValue}
              themeColor="success"
            />
          </Card>

          <Card style={styles.chartCard}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Revenue — last 6 months
            </ThemedText>
            <RevenueChart data={data?.revenueByMonth ?? []} />
          </Card>

          <View style={styles.quickActions}>
            <View style={styles.quickActionButton}>
              <PrimaryButton label="New Invoice" onPress={() => router.push('/(freelancer)/invoices/new')} />
            </View>
            <View style={styles.quickActionButton}>
              <PrimaryButton label="New Project" variant="secondary" onPress={() => router.push('/(freelancer)/projects/new')} />
            </View>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerName: {
    fontSize: 28,
    lineHeight: 34,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
  },
  wideStatCard: {
    marginBottom: 12,
  },
  statValue: {
    marginTop: 6,
  },
  chartCard: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickActionButton: {
    flex: 1,
  },
});
