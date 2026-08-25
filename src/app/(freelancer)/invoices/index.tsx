import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { GlowBackground } from '@/components/glow-background';
import { IcoChevronRight } from '@/components/icons';
import { OfflineBanner } from '@/components/offline-banner';
import { PillActionButton } from '@/components/pill-action-button';
import { ScreenHeader } from '@/components/screen-header';
import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { avatarColorFor } from '@/lib/avatar-colors';
import { formatCurrency, formatInvoiceRef } from '@/lib/format';
import { getInvoices, type InvoiceWithClient } from '@/lib/queries';
import type { InvoiceStatus } from '@/types/database';

const FILTERS: (InvoiceStatus | 'all')[] = ['all', 'draft', 'sent', 'paid', 'overdue'];

export default function InvoicesScreen() {
  const { profile } = useAuth();
  const theme = useTheme();
  const { radius, cardShadow } = useThemeTokens();
  const freelancerId = profile?.id ?? '';
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`invoices:${freelancerId}`, () => getInvoices(freelancerId));

  const filtered = useMemo(() => {
    const invoices = data ?? [];
    return filter === 'all' ? invoices : invoices.filter((i) => i.status === filter);
  }, [data, filter]);

  const totals = useMemo(() => {
    const invoices = data ?? [];
    return {
      overdue: invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + Number(i.amount), 0),
      paid: invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0),
    };
  }, [data]);

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground height={280} cy="-4%" r="70%" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <ScreenHeader title="Invoices" action={<PillActionButton label="New" onPress={() => router.push('/(freelancer)/invoices/new')} />} />

        <OfflineBanner visible={isOffline} />

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 4 }, cardShadowStyle(cardShadow.color, cardShadow.opacity)]}>
            <ThemedText type="label" themeColor="textSecondary" style={styles.statLabel}>
              Overdue
            </ThemedText>
            <ThemedText type="title" themeColor="danger" style={styles.statValue}>
              {formatCurrency(totals.overdue)}
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 4 }, cardShadowStyle(cardShadow.color, cardShadow.opacity)]}>
            <ThemedText type="label" themeColor="textSecondary" style={styles.statLabel}>
              Paid
            </ThemedText>
            <ThemedText type="title" themeColor="success" style={styles.statValue}>
              {formatCurrency(totals.paid)}
            </ThemedText>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f === filter;
            const count = f === 'all' ? null : (data ?? []).filter((i) => i.status === f).length;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterPill, { borderRadius: radius.pill, backgroundColor: active ? theme.primary : theme.backgroundElement }]}
              >
                <ThemedText type="small" style={{ color: active ? theme.primaryText : theme.textSecondary, textTransform: 'capitalize' }}>
                  {f}
                  {count !== null ? ` · ${count}` : ''}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {filtered.map((inv) => (
            <InvoiceListItem key={inv.id} invoice={inv} />
          ))}
          {!isLoading && filtered.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No invoices
            </ThemedText>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function InvoiceListItem({ invoice }: { invoice: InvoiceWithClient }) {
  const theme = useTheme();
  const { radius, cardShadow } = useThemeTokens();
  const accent = avatarColorFor(invoice.client_id);
  const clientName = invoice.client?.name ?? 'Unknown client';
  const initials = clientName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Pressable onPress={() => router.push(`/(freelancer)/invoices/${invoice.id}`)}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 2, opacity: pressed ? 0.9 : 1 },
            cardShadowStyle(cardShadow.color, cardShadow.opacity),
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: `${accent}18`, borderColor: `${accent}28` }]}>
            <ThemedText type="smallBold" style={{ color: accent }}>
              {initials}
            </ThemedText>
          </View>
          <View style={styles.info}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {clientName}
            </ThemedText>
            <View style={styles.metaRow}>
              <ThemedText type="code" themeColor="textSecondary">
                {formatInvoiceRef(invoice.id)}
              </ThemedText>
              {invoice.project?.title ? (
                <>
                  <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.description}>
                    {invoice.project.title}
                  </ThemedText>
                </>
              ) : null}
            </View>
          </View>
          <View style={styles.right}>
            <ThemedText type="smallBold">{formatCurrency(Number(invoice.amount), invoice.currency)}</ThemedText>
            <InvoiceStatusBadge status={invoice.status} />
          </View>
          <IcoChevronRight color={theme.border} size={14} />
        </View>
      )}
    </Pressable>
  );
}

function cardShadowStyle(color: string, opacity: number) {
  return { shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: opacity, shadowRadius: 16, elevation: 3 };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingBottom: 160,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    padding: 14,
  },
  statLabel: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  filterRow: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  description: {
    flexShrink: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 5,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
