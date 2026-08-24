import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { OfflineBanner } from '@/components/offline-banner';
import { ProjectStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { getProjects } from '@/lib/queries';
import type { ProjectStatus } from '@/types/database';

const GROUPS: { label: string; status: ProjectStatus }[] = [
  { label: 'Active', status: 'active' },
  { label: 'On hold', status: 'on_hold' },
  { label: 'Completed', status: 'completed' },
];

export default function ProjectsScreen() {
  const { profile } = useAuth();
  const freelancerId = profile?.id ?? '';
  const theme = useTheme();

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`projects:${freelancerId}`, () => getProjects(freelancerId));

  const grouped = useMemo(() => {
    const projects = data ?? [];
    return GROUPS.map((g) => ({ ...g, items: projects.filter((p) => p.status === g.status) }));
  }, [data]);

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        <OfflineBanner visible={isOffline} />

        {grouped.map((group) =>
          group.items.length === 0 ? null : (
            <View key={group.status} style={styles.group}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.groupTitle}>
                {group.label.toUpperCase()}
              </ThemedText>
              {group.items.map((project) => (
                <Pressable key={project.id} onPress={() => router.push(`/(freelancer)/projects/${project.id}`)}>
                  <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <View style={styles.cardHeader}>
                      <ThemedText type="smallBold" style={styles.cardTitle}>
                        {project.title}
                      </ThemedText>
                      <ProjectStatusBadge status={project.status} />
                    </View>
                    {project.client ? (
                      <View style={styles.cardFooter}>
                        <Avatar name={project.client.name} url={project.client.avatar_url} size={22} />
                        <ThemedText type="small" themeColor="textSecondary" style={styles.cardClientName}>
                          {project.client.name}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>
          )
        )}

        {!isLoading && (data?.length ?? 0) === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No projects yet.
          </ThemedText>
        ) : null}
      </ScrollView>

      <Pressable style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => router.push('/(freelancer)/projects/new')}>
        <ThemedText type="title" themeColor="primaryText" style={styles.fabPlus}>
          +
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  group: {
    marginBottom: 20,
  },
  groupTitle: {
    marginBottom: 10,
    letterSpacing: 0.5,
    fontSize: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  cardClientName: {
    marginLeft: 8,
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
