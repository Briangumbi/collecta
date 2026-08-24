import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { OfflineBanner } from '@/components/offline-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format';
import { getClients, type ClientSummary } from '@/lib/queries';

export default function ClientsScreen() {
  const { profile } = useAuth();
  const freelancerId = profile?.id ?? '';
  const theme = useTheme();

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
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
      />
    </ThemedView>
  );
}

function ClientRow({ client, onPress }: { client: ClientSummary; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]} onPress={onPress}>
      <Avatar name={client.name} url={client.avatar_url} size={44} />
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
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
