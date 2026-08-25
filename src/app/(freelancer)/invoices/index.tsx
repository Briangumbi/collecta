import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { OfflineBanner } from '@/components/offline-banner';
import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { formatCurrency, formatDate } from '@/lib/format';
import { getInvoices, type InvoiceWithClient } from '@/lib/queries';
import type { InvoiceStatus } from '@/types/database';

const FILTERS: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

export default function InvoicesScreen() {
  const { profile } = useAuth();
  const freelancerId = profile?.id ?? '';
  const theme = useTheme();
  const { radius } = useThemeTokens();
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`invoices:${freelancerId}`, () => getInvoices(freelancerId));

  const filtered = useMemo(() => {
    if (!data) return [];
    return filter === 'all' ? data : data.filter((i) => i.status === filter);
  }, [data, filter]);

  return (
    <ThemedView style={styles.flex}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[
              styles.filterPill,
              {
                borderRadius: radius.pill,
                backgroundColor: filter === f.value ? theme.primary : theme.backgroundElement,
                borderColor: filter === f.value ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText type="smallBold" themeColor={filter === f.value ? 'primaryText' : 'text'}>
              {f.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={<OfflineBanner visible={isOffline} />}
        ListEmptyComponent={
          !isLoading ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No invoices in this view.
            </ThemedText>
          ) : null
        }
        renderItem={({ item }) => <InvoiceRow invoice={item} onPress={() => router.push(`/(freelancer)/invoices/${item.id}`)} />}
      />

      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 14,
          },
        ]}
        onPress={() => router.push('/(freelancer)/invoices/new')}
      >
        <ThemedText type="title" themeColor="primaryText" style={styles.fabPlus}>
          +
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function InvoiceRow({ invoice, onPress }: { invoice: InvoiceWithClient; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.card, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={styles.row}>
            <Avatar name={invoice.client?.name ?? '—'} size={40} />
            <View style={styles.rowText}>
              <ThemedText type="smallBold">{invoice.client?.name ?? 'Unknown client'}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Due {formatDate(invoice.due_date)}
              </ThemedText>
            </View>
            <View style={styles.rowEnd}>
              <ThemedText type="smallBold">{formatCurrency(Number(invoice.amount), invoice.currency)}</ThemedText>
              <InvoiceStatusBadge status={invoice.status} />
            </View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  filterRow: {
    flexGrow: 0,
    paddingTop: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 160,
    gap: 12,
  },
  card: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
  },
  rowEnd: {
    alignItems: 'flex-end',
    gap: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabPlus: {
    fontSize: 28,
    lineHeight: 32,
  },
});
