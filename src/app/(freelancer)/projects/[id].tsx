import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { GlowBackground } from '@/components/glow-background';
import { IcoChevronLeft, IcoChevronRight, IcoClip, IcoSend } from '@/components/icons';
import { ProgressRing } from '@/components/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { avatarColorFor } from '@/lib/avatar-colors';
import { formatDate } from '@/lib/format';
import { addAttachment, getMessages, getProjectDetail, sendMessage, toggleMilestone } from '@/lib/queries';
import { uploadProjectFile } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { Attachment, Message, Milestone, Profile, Project, ProjectStatus } from '@/types/database';

function projectStatusColor(status: ProjectStatus, theme: { primary: string; success: string }) {
  if (status === 'completed') return theme.success;
  if (status === 'on_hold') return '#f97316';
  return theme.primary;
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const theme = useTheme();
  const { radius, fonts, cardShadow } = useThemeTokens();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

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

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getMessages(id).then((data) => mounted && setMessages(data));

    const channel = supabase
      .channel(`messages:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${id}` }, (payload) => {
        setMessages((prev) => (prev.some((m) => m.id === (payload.new as Message).id) ? prev : [...prev, payload.new as Message]));
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading || !project || !client || !profile) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const color = projectStatusColor(project.status, theme);
  const done = milestones.filter((m) => m.status === 'complete').length;
  const pct = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0;
  const statusLabel = project.status === 'on_hold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1);

  const handleToggleMilestone = async (milestone: Milestone) => {
    const nextStatus = milestone.status === 'complete' ? 'pending' : 'complete';
    setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? { ...m, status: nextStatus } : m)));
    await toggleMilestone(milestone.id, nextStatus);
  };

  const handleCapture = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Collecta needs access to continue.');
      return;
    }
    const result =
      source === 'camera' ? await ImagePicker.launchCameraAsync({ quality: 0.7 }) : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
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

  const handleSend = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    setSending(true);
    try {
      await sendMessage({ projectId: project.id, senderId: profile.id, body });
    } finally {
      setSending(false);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground height={240} cy="0%" r="60%" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <IcoChevronLeft color={theme.textSecondary} size={18} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {client.name}
            </ThemedText>
            <ThemedText style={{ fontFamily: fonts.display, fontSize: 18, color: theme.text }} numberOfLines={1}>
              {project.title}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.backgroundElement, borderRadius: radius.card + 4 },
            { shadowColor: cardShadow.color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: cardShadow.opacity * 1.2, shadowRadius: 30, elevation: 6 },
          ]}
        >
          <View style={styles.heroRow}>
            <View style={styles.ringWrap}>
              <ProgressRing pct={pct} color={color} size={80} strokeWidth={5} />
              <View style={styles.ringLabel}>
                <ThemedText style={{ fontFamily: fonts.displayHeavy, fontSize: 20, color }}>{pct}%</ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  done
                </ThemedText>
              </View>
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaCol}>
                  <ThemedText type="code" themeColor="textSecondary" style={styles.heroMetaLabel}>
                    Status
                  </ThemedText>
                  <ThemedText type="small" style={{ color, fontWeight: '600' }}>
                    {statusLabel}
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: theme.neutralBg }]}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
              </View>
              <ThemedText type="code" themeColor="textSecondary" style={styles.heroFootnote}>
                {done} of {milestones.length} milestones complete
              </ThemedText>
            </View>
          </View>
        </View>

        {milestones.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
              Milestones
            </ThemedText>
            <View style={styles.milestoneList}>
              {milestones.map((m) => {
                const isDone = m.status === 'complete';
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => handleToggleMilestone(m)}
                    style={[styles.milestoneRow, { backgroundColor: theme.backgroundElement, borderRadius: 14 }]}
                  >
                    <View style={[styles.checkbox, { backgroundColor: isDone ? color : theme.neutralBg, borderColor: isDone ? color : theme.border }]}>
                      {isDone ? <Ionicons name="checkmark" size={13} color={theme.primaryText} /> : null}
                    </View>
                    <ThemedText type="small" themeColor={isDone ? 'textSecondary' : 'text'} style={[styles.milestoneLabel, isDone && styles.milestoneDone]}>
                      {m.title}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrowNoMargin}>
              Attachments
            </ThemedText>
            <View style={styles.attachActions}>
              <Pressable onPress={() => handleCapture('camera')} disabled={uploading} style={styles.attachActionButton}>
                <IcoClip color={theme.primary} size={13} />
                <ThemedText type="small" themeColor="primary">
                  Scan
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => handleCapture('library')} disabled={uploading} style={styles.attachActionButton}>
                <ThemedText type="small" themeColor="primary">
                  Library
                </ThemedText>
              </Pressable>
            </View>
          </View>
          {uploading ? <ActivityIndicator style={styles.uploadingSpinner} /> : null}
          {attachments.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No files yet.
            </ThemedText>
          ) : (
            <View style={styles.attachmentList}>
              {attachments.map((att) => (
                <View key={att.id} style={[styles.attachmentRow, { backgroundColor: theme.backgroundElement, borderRadius: 14 }]}>
                  <View style={[styles.fileIcon, { backgroundColor: theme.warningBg, borderColor: theme.border }]}>
                    <ThemedText type="code" themeColor="primary">
                      {att.type === 'receipt' ? 'IMG' : 'FILE'}
                    </ThemedText>
                  </View>
                  <View style={styles.fileText}>
                    <ThemedText type="small" numberOfLines={1}>
                      {att.type === 'receipt' ? 'Receipt' : 'Deliverable'}
                    </ThemedText>
                    <ThemedText type="code" themeColor="textSecondary">
                      {formatDate(att.created_at)}
                    </ThemedText>
                  </View>
                  <IcoChevronRight color={theme.border} size={14} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary" style={styles.sectionEyebrow}>
            Messages
          </ThemedText>
          <View style={styles.messageList}>
            {messages.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                No messages yet — say hello.
              </ThemedText>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} mine={msg.sender_id === profile.id} clientName={client.name} />
              ))
            )}
          </View>

          <View style={[styles.messageInputRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border, borderRadius: 14 }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message..."
              placeholderTextColor={theme.textSecondary}
              style={{ flex: 1, fontSize: 13, color: theme.text }}
              multiline
            />
            <Pressable
              onPress={handleSend}
              disabled={sending || !draft.trim()}
              style={[styles.sendButton, { backgroundColor: draft.trim() ? theme.primary : theme.backgroundSelected }]}
            >
              <IcoSend color={draft.trim() ? theme.primaryText : theme.textSecondary} size={14} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function MessageBubble({ message, mine, clientName }: { message: Message; mine: boolean; clientName: string }) {
  const theme = useTheme();
  const { fonts } = useThemeTokens();
  const accent = avatarColorFor(message.sender_id);
  const initials = (mine ? 'Me' : clientName)
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      {!mine ? (
        <View style={[styles.bubbleAvatar, { backgroundColor: `${accent}20`, borderColor: `${accent}30` }]}>
          <ThemedText style={{ fontFamily: fonts.display, fontSize: 11, color: accent }}>{initials}</ThemedText>
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          mine ? styles.bubbleMineShape : styles.bubbleTheirsShape,
          { backgroundColor: mine ? theme.primary : theme.backgroundSelected },
        ]}
      >
        <ThemedText type="small" themeColor={mine ? 'primaryText' : 'text'} style={styles.bubbleText}>
          {message.body}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  heroCard: {
    padding: 20,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  ringWrap: {
    width: 80,
    height: 80,
  },
  ringLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
  },
  heroMetaRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  heroMetaCol: {
    flex: 1,
  },
  heroMetaLabel: {
    marginBottom: 2,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  heroFootnote: {
    marginTop: 5,
  },
  section: {
    marginTop: 4,
    marginBottom: 16,
  },
  sectionEyebrow: {
    marginBottom: 12,
  },
  sectionEyebrowNoMargin: {
    marginBottom: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  attachActions: {
    flexDirection: 'row',
    gap: 12,
  },
  attachActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  milestoneList: {
    gap: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneLabel: {
    flex: 1,
  },
  milestoneDone: {
    textDecorationLine: 'line-through',
  },
  uploadingSpinner: {
    marginBottom: 12,
  },
  attachmentList: {
    gap: 8,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  messageList: {
    gap: 12,
    marginBottom: 14,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '72%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMineShape: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleTheirsShape: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    lineHeight: 19,
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
