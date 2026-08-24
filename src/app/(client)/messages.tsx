import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessageThread } from '@/components/message-thread';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { getClientProjects } from '@/lib/queries';
import type { ProjectWithClient } from '@/lib/queries';

export default function ClientMessagesScreen() {
  const { profile } = useAuth();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const theme = useTheme();
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [selected, setSelected] = useState<string | null>(projectId ?? null);

  useEffect(() => {
    if (!profile) return;
    getClientProjects(profile.id).then((data) => {
      setProjects(data);
      if (!selected && data.length === 1) setSelected(data[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    if (projectId) setSelected(projectId);
  }, [projectId]);

  if (!profile) return null;

  if (selected) {
    const project = projects.find((p) => p.id === selected);
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <View style={[styles.threadHeader, { borderColor: theme.border }]}>
            <Pressable onPress={() => setSelected(null)} hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </Pressable>
            <ThemedText type="smallBold" style={styles.threadHeaderTitle}>
              {project?.title ?? 'Messages'}
            </ThemedText>
          </View>
          <MessageThread projectId={selected} currentUserId={profile.id} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          Messages
        </ThemedText>
        {projects.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No projects yet.
          </ThemedText>
        ) : (
          projects.map((project) => (
            <Pressable key={project.id} onPress={() => setSelected(project.id)}>
              <View style={[styles.projectRow, { borderColor: theme.border }]}>
                <ThemedText type="default">{project.title}</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </View>
            </Pressable>
          ))
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 12,
  },
  empty: {
    paddingHorizontal: 20,
  },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  threadHeaderTitle: {
    flex: 1,
  },
});
