import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getMessages, sendMessage } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-theme';
import type { Message } from '@/types/database';

export function MessageThread({ projectId, currentUserId }: { projectId: string; currentUserId: string }) {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    let mounted = true;
    getMessages(projectId).then((data) => mounted && setMessages(data));

    const channel = supabase
      .channel(`messages:${projectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === (payload.new as Message).id) ? prev : [...prev, payload.new as Message]));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    setSending(true);
    try {
      await sendMessage({ projectId, senderId: currentUserId, body });
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.sender_id === currentUserId;
          return (
            <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
              <View
                style={[
                  styles.bubble,
                  { backgroundColor: mine ? theme.primary : theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <ThemedText type="small" themeColor={mine ? 'primaryText' : 'text'}>
                  {item.body}
                </ThemedText>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No messages yet — say hello.
          </ThemedText>
        }
      />
      <View style={[styles.inputRow, { borderTopColor: theme.border }]}>
        <MessageInput value={draft} onChangeText={setDraft} onSubmit={handleSend} sending={sending} />
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageInput({
  value,
  onChangeText,
  onSubmit,
  sending,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  sending: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.inputInnerRow}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Message"
        placeholderTextColor={theme.textSecondary}
        style={[styles.textInput, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
        multiline
      />
      <Pressable
        onPress={onSubmit}
        disabled={sending || !value.trim()}
        style={[styles.sendButton, { backgroundColor: theme.primary, opacity: sending || !value.trim() ? 0.5 : 1 }]}
      >
        <ThemedText type="smallBold" themeColor="primaryText">
          Send
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    padding: 16,
    gap: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
  inputRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  inputInnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
