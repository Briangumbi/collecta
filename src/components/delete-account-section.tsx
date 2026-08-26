import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { deleteOwnAccount } from '@/lib/account';

/**
 * Deliberately high-friction: reveal a confirm panel, require typing DELETE,
 * then one more native confirm before the irreversible call — this is the
 * most destructive action anywhere in the app.
 */
export function DeleteAccountSection({ warning }: { warning: string }) {
  const { signOut } = useAuth();
  const theme = useTheme();
  const { radius } = useThemeTokens();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = () => {
    Alert.alert('Delete your account?', `This cannot be undone. ${warning}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete permanently',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteOwnAccount();
            await signOut();
          } catch (err) {
            Alert.alert('Could not delete account', err instanceof Error ? err.message : 'Something went wrong.');
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold" themeColor="danger" style={styles.title}>
        Danger Zone
      </ThemedText>
      {!confirming ? (
        <Pressable
          onPress={() => setConfirming(true)}
          style={[styles.revealButton, { borderColor: theme.dangerBg, backgroundColor: theme.dangerBg, borderRadius: radius.pill }]}
        >
          <ThemedText type="smallBold" themeColor="danger">
            Delete Account
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.confirmBlock}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.warningText}>
            {warning} This cannot be undone. Type DELETE to confirm.
          </ThemedText>
          <TextField label="Confirm" value={confirmText} onChangeText={setConfirmText} placeholder="DELETE" autoCapitalize="characters" />
          <Pressable
            onPress={handleDelete}
            disabled={!canDelete || deleting}
            style={[
              styles.deleteButton,
              { backgroundColor: theme.danger, borderRadius: radius.pill, opacity: !canDelete || deleting ? 0.5 : 1 },
            ]}
          >
            {deleting ? <ActivityIndicator color="#FFFFFF" /> : <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>Permanently delete my account</ThemedText>}
          </Pressable>
          <PrimaryButton
            label="Cancel"
            variant="secondary"
            onPress={() => {
              setConfirming(false);
              setConfirmText('');
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  title: {
    marginBottom: 2,
  },
  revealButton: {
    height: 52,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBlock: {
    gap: 4,
  },
  warningText: {
    lineHeight: 18,
    marginBottom: 6,
  },
  deleteButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
});
