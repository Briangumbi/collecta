import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { OfflineBanner } from '@/components/offline-banner';
import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { formatCurrency, formatDate } from '@/lib/format';
import { getClientInvoices } from '@/lib/queries';
import type { Invoice } from '@/types/database';

export default function ClientInvoicesScreen() {
  const { profile } = useAuth();
  const clientId = profile?.id ?? '';

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`client-invoices:${clientId}`, () => getClientInvoices(clientId));

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          Invoices
        </ThemedText>
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
        />
      </SafeAreaView>
    </ThemedView>
  );
}

function InvoiceRow({ invoice, onPress }: { invoice: Invoice; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.card, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <ThemedText type="smallBold" style={styles.amount}>
                {formatCurrency(Number(invoice.amount), invoice.currency)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Due {formatDate(invoice.due_date)}
              </ThemedText>
            </View>
            <InvoiceStatusBadge status={invoice.status} />
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: {
    fontSize: 30,
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {
    flex: 1,
  },
  amount: {
    fontSize: 18,
    marginBottom: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
