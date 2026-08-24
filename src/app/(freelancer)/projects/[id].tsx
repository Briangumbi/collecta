import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { MessageThread } from '@/components/message-thread';
import { ProjectStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/format';
import { addAttachment, getProjectDetail, toggleMilestone } from '@/lib/queries';
import { uploadProjectFile } from '@/lib/storage';
import type { Attachment, Milestone, Profile, Project } from '@/types/database';

type Tab = 'milestones' | 'files' | 'messages';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const theme = useTheme();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('milestones');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!id) return;
    const result = await getProjectDetail(id);
    setProject(result.project);
    setClient(result.client);
    setMilestones(result.milestones);
    setAttachments(result.attachments);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !project || !client || !profile) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const handleToggleMilestone = async (milestone: Milestone) => {
    const nextStatus = milestone.status === 'complete' ? 'pending' : 'complete';
    setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? { ...m, status: nextStatus } : m)));
    await toggleMilestone(milestone.id, nextStatus);
  };

  const handleCapture = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Ledger needs access to continue.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const fileName = asset.fileName ?? `receipt-${Date.now()}.jpg`;
      const url = await uploadProjectFile(project.id, asset.uri, fileName);
      await addAttachment({ projectId: project.id, uploadedBy: profile.id, fileUrl: url, type: 'receipt' });
      await load();
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {project.title}
        </ThemedText>
        <View style={styles.headerMeta}>
          <ProjectStatusBadge status={project.status} />
          <View style={styles.clientChip}>
            <Avatar name={client.name} url={client.avatar_url} size={20} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.clientChipLabel}>
              {client.name}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.tabBar, { borderColor: theme.border }]}>
        <TabButton label="Milestones" active={tab === 'milestones'} onPress={() => setTab('milestones')} />
        <TabButton label="Files" active={tab === 'files'} onPress={() => setTab('files')} />
        <TabButton label="Messages" active={tab === 'messages'} onPress={() => setTab('messages')} />
      </View>

      {tab === 'milestones' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {milestones.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No milestones yet.
            </ThemedText>
          ) : (
            milestones.map((milestone) => (
              <Pressable key={milestone.id} onPress={() => handleToggleMilestone(milestone)}>
                <Card style={styles.milestoneCard}>
                  <View style={styles.milestoneRow}>
                    <Ionicons
                      name={milestone.status === 'complete' ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={milestone.status === 'complete' ? theme.success : theme.textSecondary}
                    />
                    <View style={styles.milestoneText}>
                      <ThemedText
                        type="smallBold"
                        style={milestone.status === 'complete' ? styles.milestoneDone : undefined}
                      >
                        {milestone.title}
                      </ThemedText>
                      {milestone.due_date ? (
                        <ThemedText type="small" themeColor="textSecondary">
                          Due {formatDate(milestone.due_date)}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </ScrollView>
      ) : null}

      {tab === 'files' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.uploadRow}>
            <Pressable
              style={[styles.uploadButton, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
              onPress={() => handleCapture('camera')}
              disabled={uploading}
            >
              <Ionicons name="camera" size={20} color={theme.primary} />
              <ThemedText type="small" style={styles.uploadLabel}>
                Scan receipt
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.uploadButton, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
              onPress={() => handleCapture('library')}
              disabled={uploading}
            >
              <Ionicons name="image" size={20} color={theme.primary} />
              <ThemedText type="small" style={styles.uploadLabel}>
                From library
              </ThemedText>
            </Pressable>
          </View>
          {uploading ? <ActivityIndicator style={styles.uploadingSpinner} /> : null}

          {attachments.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No files yet.
            </ThemedText>
          ) : (
            attachments.map((file) => (
              <Card key={file.id} style={styles.fileCard}>
                <View style={styles.fileRow}>
                  <Ionicons name={file.type === 'receipt' ? 'receipt-outline' : 'document-outline'} size={20} color={theme.textSecondary} />
                  <View style={styles.fileText}>
                    <ThemedText type="small" numberOfLines={1}>
                      {file.type === 'receipt' ? 'Receipt' : 'Deliverable'}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatDate(file.created_at)}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      ) : null}

      {tab === 'messages' ? <MessageThread projectId={project.id} currentUserId={profile.id} /> : null}
    </ThemedView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <ThemedText type="smallBold" themeColor={active ? 'primary' : 'textSecondary'}>
        {label}
      </ThemedText>
      {active ? <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientChipLabel: {
    marginLeft: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
  },
  tabButton: {
    marginRight: 24,
    paddingBottom: 10,
    alignItems: 'center',
  },
  tabIndicator: {
    marginTop: 8,
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  milestoneCard: {
    marginBottom: 10,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneText: {
    marginLeft: 12,
  },
  milestoneDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  uploadLabel: {},
  uploadingSpinner: {
    marginBottom: 16,
  },
  fileCard: {
    marginBottom: 10,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileText: {
    marginLeft: 12,
    flex: 1,
  },
});
