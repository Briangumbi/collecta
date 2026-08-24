import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { OfflineBanner } from '@/components/offline-banner';
import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, formatDate } from '@/lib/format';
import { getClientInvoices } from '@/lib/queries';
import type { Invoice } from '@/types/database';

export default function ClientInvoicesScreen() {
  const { profile } = useAuth();
  const clientId = profile?.id ?? '';
  const theme = useTheme();

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`client-invoices:${clientId}`, () => getClientInvoices(clientId));

  return (
    <ThemedView style={styles.flex}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={<OfflineBanner visible={isOffline} />}
        ListEmptyComponent={
          !isLoading ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No invoices yet.
            </ThemedText>
          ) : null
        }
        renderItem={({ item }) => <InvoiceRow invoice={item} onPress={() => router.push(`/(client)/invoices/${item.id}`)} />}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
      />
    </ThemedView>
  );
}

function InvoiceRow({ invoice, onPress }: { invoice: Invoice; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]} onPress={onPress}>
      <View style={styles.rowText}>
        <ThemedText type="smallBold">{formatCurrency(Number(invoice.amount), invoice.currency)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Due {formatDate(invoice.due_date)}
        </ThemedText>
      </View>
      <InvoiceStatusBadge status={invoice.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
