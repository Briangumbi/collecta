import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { OfflineBanner } from '@/components/offline-banner';
import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
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
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
      />

      <Pressable style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => router.push('/(freelancer)/invoices/new')}>
        <ThemedText type="title" themeColor="primaryText" style={styles.fabPlus}>
          +
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function InvoiceRow({ invoice, onPress }: { invoice: InvoiceWithClient; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]} onPress={onPress}>
      <Avatar name={invoice.client?.name ?? '—'} url={invoice.client?.avatar_url} size={40} />
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
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
  },
  rowEnd: {
    alignItems: 'flex-end',
    gap: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabPlus: {
    fontSize: 28,
    lineHeight: 32,
  },
});
