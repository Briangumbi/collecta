import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { OfflineBanner } from '@/components/offline-banner';
import { ProjectStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { getClientProjects } from '@/lib/queries';

export default function ClientHomeScreen() {
  const { profile } = useAuth();
  const clientId = profile?.id ?? '';

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`client-projects:${clientId}`, () => getClientProjects(clientId));

  if (!profile) return null;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
          <View style={styles.header}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Welcome back
              </ThemedText>
              <ThemedText type="title" style={styles.headerName}>
                {profile.name.split(' ')[0]}
              </ThemedText>
            </View>
            <Avatar name={profile.name} size={48} />
          </View>

          <OfflineBanner visible={isOffline} />

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Your projects
          </ThemedText>

          {!isLoading && (data?.length ?? 0) === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No projects yet.
            </ThemedText>
          ) : (
            (data ?? []).map((project) => (
              <Pressable key={project.id} onPress={() => router.push(`/(client)/messages?projectId=${project.id}`)}>
                <Card style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <ThemedText type="smallBold" style={styles.projectTitle}>
                      {project.title}
                    </ThemedText>
                    <ProjectStatusBadge status={project.status} />
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerName: {
    fontSize: 28,
    lineHeight: 34,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  projectCard: {
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitle: {
    flex: 1,
    marginRight: 8,
  },
});
