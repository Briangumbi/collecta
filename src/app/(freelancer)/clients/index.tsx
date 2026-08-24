import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { OfflineBanner } from '@/components/offline-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { formatCurrency } from '@/lib/format';
import { getClients, type ClientSummary } from '@/lib/queries';

export default function ClientsScreen() {
  const { profile } = useAuth();
  const freelancerId = profile?.id ?? '';

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`clients:${freelancerId}`, () => getClients(freelancerId));

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
              No clients yet.
            </ThemedText>
          ) : null
        }
        renderItem={({ item }) => <ClientRow client={item} onPress={() => router.push(`/(freelancer)/clients/${item.id}`)} />}
      />
    </ThemedView>
  );
}

function ClientRow({ client, onPress }: { client: ClientSummary; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.card, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={styles.row}>
            <Avatar name={client.name} size={44} />
            <View style={styles.rowText}>
              <ThemedText type="smallBold">{client.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {client.activeProjectCount} active project{client.activeProjectCount === 1 ? '' : 's'}
              </ThemedText>
            </View>
            {client.outstandingBalance > 0 ? (
              <ThemedText type="smallBold" themeColor="warning">
                {formatCurrency(client.outstandingBalance)}
              </ThemedText>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Paid up
              </ThemedText>
            )}
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 130,
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
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
