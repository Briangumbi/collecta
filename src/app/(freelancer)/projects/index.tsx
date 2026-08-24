import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
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
              <ThemedText type="label" themeColor="textSecondary" style={styles.groupTitle}>
                {group.label}
              </ThemedText>
              {group.items.map((project) => (
                <Pressable key={project.id} onPress={() => router.push(`/(freelancer)/projects/${project.id}`)}>
                  <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                      <ThemedText type="smallBold" style={styles.cardTitle}>
                        {project.title}
                      </ThemedText>
                      <ProjectStatusBadge status={project.status} />
                    </View>
                    {project.client ? (
                      <View style={styles.cardFooter}>
                        <Avatar name={project.client.name} size={22} />
                        <ThemedText type="small" themeColor="textSecondary" style={styles.cardClientName}>
                          {project.client.name}
                        </ThemedText>
                      </View>
                    ) : null}
                  </Card>
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
        onPress={() => router.push('/(freelancer)/projects/new')}
      >
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
  },
  card: {
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
    elevation: 6,
  },
  fabPlus: {
    fontSize: 28,
    lineHeight: 32,
  },
});
