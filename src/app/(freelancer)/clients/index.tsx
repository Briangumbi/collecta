import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { GlowBackground } from '@/components/glow-background';
import { IcoChevronRight, IcoSearch } from '@/components/icons';
import { OfflineBanner } from '@/components/offline-banner';
import { PillActionButton } from '@/components/pill-action-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { avatarColorFor } from '@/lib/avatar-colors';
import { formatCurrency, formatRelativeTime } from '@/lib/format';
import { getClients, type ClientSummary } from '@/lib/queries';

const FILTERS = ['all', 'active', 'inactive'] as const;
type Filter = (typeof FILTERS)[number];

export default function ClientsScreen() {
  const { profile } = useAuth();
  const theme = useTheme();
  const { radius, cardShadow } = useThemeTokens();
  const freelancerId = profile?.id ?? '';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`clients:${freelancerId}`, () => getClients(freelancerId));

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const filtered = useMemo(() => {
    const clients = data ?? [];
    return clients.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [data, filter, query]);

  const totalOutstanding = (data ?? []).reduce((sum, c) => sum + c.outstandingBalance, 0);
  const activeCount = (data ?? []).filter((c) => c.status === 'active').length;
  const owingCount = (data ?? []).filter((c) => c.outstandingBalance > 0).length;

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground height={280} cy="-4%" r="70%" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <ScreenHeader
          title="Clients"
          action={<PillActionButton label="Add" onPress={() => router.push('/(freelancer)/clients/new')} />}
        />

        <OfflineBanner visible={isOffline} />

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 4 }, cardShadowStyle(cardShadow.color, cardShadow.opacity)]}>
            <ThemedText type="label" themeColor="textSecondary" style={styles.summaryLabel}>
              Total Clients
            </ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>
              {data?.length ?? 0}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.summaryFootnote}>
              {activeCount} active
            </ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 4 }, cardShadowStyle(cardShadow.color, cardShadow.opacity)]}>
            <ThemedText type="label" themeColor="textSecondary" style={styles.summaryLabel}>
              Outstanding
            </ThemedText>
            <ThemedText type="title" themeColor="primary" style={styles.summaryValue}>
              {formatCurrency(totalOutstanding)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.summaryFootnote}>
              {owingCount} clients owe
            </ThemedText>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <IcoSearch color={theme.textSecondary} size={16} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search clients..."
            placeholderTextColor={theme.textSecondary}
            style={{ flex: 1, fontSize: 13, color: theme.text }}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterPill,
                  { borderRadius: radius.pill, backgroundColor: active ? theme.primary : theme.backgroundElement },
                ]}
              >
                <ThemedText type="small" style={{ color: active ? theme.primaryText : theme.textSecondary, textTransform: 'capitalize' }}>
                  {f}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.list}>
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
          {!isLoading && filtered.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No clients found
            </ThemedText>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function ClientCard({ client }: { client: ClientSummary }) {
  const theme = useTheme();
  const { radius, cardShadow } = useThemeTokens();
  const hasOutstanding = client.outstandingBalance > 0;
  const accent = avatarColorFor(client.id);
  const initials = client.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Pressable onPress={() => router.push(`/(freelancer)/clients/${client.id}`)}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderRadius: radius.card, opacity: pressed ? 0.9 : 1 },
            cardShadowStyle(cardShadow.color, cardShadow.opacity),
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: `${accent}18`, borderColor: `${accent}30` }]}>
            <ThemedText type="smallBold" style={{ color: accent }}>
              {initials}
            </ThemedText>
            {client.status === 'active' ? (
              <View style={[styles.onlineDot, { backgroundColor: theme.success, borderColor: theme.backgroundElement }]} />
            ) : null}
          </View>

          <View style={styles.info}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {client.name}
            </ThemedText>
            <View style={styles.metaRow}>
              <ThemedText type="code" themeColor="textSecondary">
                {client.activeProjectCount} project{client.activeProjectCount === 1 ? '' : 's'}
              </ThemedText>
              {hasOutstanding ? (
                <>
                  <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                  <ThemedText type="code" themeColor="primary">
                    {formatCurrency(client.outstandingBalance)} due
                  </ThemedText>
                </>
              ) : null}
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.lastActivity}>
              {formatRelativeTime(client.lastActivityAt)}
            </ThemedText>
          </View>

          <View style={styles.right}>
            <ThemedText type="smallBold" themeColor={hasOutstanding ? 'primary' : 'textSecondary'}>
              {hasOutstanding ? formatCurrency(client.outstandingBalance) : formatCurrency(client.totalBilled)}
            </ThemedText>
            <ThemedText type="code" themeColor="textSecondary">
              {hasOutstanding ? 'outstanding' : 'total billed'}
            </ThemedText>
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
    paddingBottom: 130,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
  },
  summaryLabel: {
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 30,
    lineHeight: 34,
  },
  summaryFootnote: {
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  lastActivity: {
    marginTop: 3,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
