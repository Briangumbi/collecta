import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { GlowBackground } from '@/components/glow-background';
import { IcoChevronLeft, IcoMail } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { avatarColorFor } from '@/lib/avatar-colors';
import { formatDate, formatInvoiceRef, getCurrencySymbol } from '@/lib/format';
import { getInvoiceDetail, markInvoicePaidManually, markInvoiceSent } from '@/lib/queries';
import { sendPaymentReminder } from '@/lib/reminders';
import type { Invoice, Profile, Project } from '@/types/database';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { radius, fonts, cardShadow } = useThemeTokens();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [project, setProject] = useState<Pick<Project, 'id' | 'title'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const load = async () => {
    if (!id) return;
    const result = await getInvoiceDetail(id);
    setInvoice(result.invoice);
    setClient(result.client);
    setProject(result.project);
    setLoading(false);
  };

  // Refetch on focus, not just mount — expo-router keeps this screen mounted in the
  // background when navigating to /invoices/new for editing, so a plain useEffect
  // wouldn't pick up the change on the way back.
  useFocusEffect(
    useCallback(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])
  );

  if (loading || !invoice || !client) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const isPaid = invoice.status === 'paid';
  const isDraft = invoice.status === 'draft';
  const accent = avatarColorFor(client.id);
  const initials = client.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleMarkPaid = () => {
    Alert.alert('Mark as paid?', 'Use this if the client paid outside Collecta (bank transfer, cash, etc).', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark as paid',
        onPress: async () => {
          setUpdating(true);
          await markInvoicePaidManually(invoice.id);
          await load();
          setUpdating(false);
        },
      },
    ]);
  };

  const handleSend = async () => {
    setUpdating(true);
    await markInvoiceSent(invoice.id);
    await load();
    setUpdating(false);
  };

  const handleReminder = async () => {
    setSendingReminder(true);
    try {
      const result = await sendPaymentReminder({ ...invoice, client: { name: client.name } });
      Alert.alert(result.sent ? 'Reminder sent' : 'Could not send reminder', result.sent ? `${client.name} was notified.` : result.reason);
    } catch (err) {
      Alert.alert('Could not send reminder', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground height={240} cy="0%" r="60%" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <IcoChevronLeft color={theme.textSecondary} size={18} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText type="code" themeColor="textSecondary">
              {formatInvoiceRef(invoice.id)}
            </ThemedText>
            <ThemedText style={{ fontFamily: fonts.display, fontSize: 18, color: theme.text }} numberOfLines={1}>
              {project?.title ?? 'Invoice'}
            </ThemedText>
          </View>
          {isDraft ? (
            <Pressable
              onPress={() => router.push({ pathname: '/(freelancer)/invoices/new', params: { id: invoice.id } })}
              hitSlop={8}
              style={[styles.editButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
            >
              <Ionicons name="create-outline" size={17} color={theme.textSecondary} />
            </Pressable>
          ) : null}
          <InvoiceStatusBadge status={invoice.status} />
        </View>

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.backgroundElement, borderRadius: radius.card + 4 },
            { shadowColor: cardShadow.color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: cardShadow.opacity * 1.2, shadowRadius: 30, elevation: 6 },
          ]}
        >
          <ThemedText type="label" themeColor="textSecondary" style={styles.heroLabel}>
            Invoice Amount
          </ThemedText>
          <View style={styles.heroAmountRow}>
            <ThemedText style={{ fontFamily: fonts.display, fontSize: 18, color: isPaid ? theme.success : theme.primary, marginTop: 8 }}>
              {getCurrencySymbol(invoice.currency)}
            </ThemedText>
            <ThemedText style={{ fontFamily: fonts.displayHeavy, fontSize: 56, letterSpacing: -1.5, color: isPaid ? theme.success : theme.primary }}>
              {Math.round(Number(invoice.amount)).toLocaleString('en-US')}
            </ThemedText>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailCol}>
              <ThemedText type="code" themeColor="textSecondary" style={styles.detailLabel}>
                Client
              </ThemedText>
              <View style={styles.clientChip}>
                <View style={[styles.clientAvatar, { backgroundColor: `${accent}20` }]}>
                  <ThemedText style={{ fontFamily: fonts.display, fontSize: 9, color: accent }}>{initials}</ThemedText>
                </View>
                <ThemedText type="small" style={{ fontWeight: '600' }} numberOfLines={1}>
                  {client.name}
                </ThemedText>
              </View>
            </View>
            <View style={styles.detailCol}>
              <ThemedText type="code" themeColor="textSecondary" style={styles.detailLabel}>
                Due Date
              </ThemedText>
              <ThemedText type="small" themeColor={invoice.status === 'overdue' ? 'danger' : 'text'} style={styles.detailValue}>
                {formatDate(invoice.due_date)}
              </ThemedText>
            </View>
            <View style={styles.detailCol}>
              <ThemedText type="code" themeColor="textSecondary" style={styles.detailLabel}>
                Created
              </ThemedText>
              <ThemedText type="small" style={styles.detailValue}>
                {formatDate(invoice.created_at)}
              </ThemedText>
            </View>
          </View>
        </View>

        {invoice.paid_at || invoice.payment_transaction_id ? (
          <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card }]}>
            {invoice.paid_at ? <InfoRow label="Paid" value={formatDate(invoice.paid_at)} /> : null}
            {invoice.payment_transaction_id ? <InfoRow label="Payment reference" value={invoice.payment_transaction_id} /> : null}
          </View>
        ) : null}

        {!isPaid ? (
          <View style={styles.actionRow}>
            {!isDraft ? (
              <Pressable
                style={[
                  styles.reminderButton,
                  { borderColor: theme.border, backgroundColor: theme.backgroundElement, borderRadius: radius.pill, opacity: sendingReminder ? 0.6 : 1 },
                ]}
                onPress={handleReminder}
                disabled={sendingReminder}
              >
                {sendingReminder ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <>
                    <IcoMail color={theme.primary} size={16} />
                    <ThemedText type="smallBold" themeColor="primary">
                      Reminder
                    </ThemedText>
                  </>
                )}
              </Pressable>
            ) : null}
            <View style={styles.sendButtonWrap}>
              <PrimaryButton
                label={isDraft ? 'Send Invoice' : 'Mark as Paid'}
                onPress={isDraft ? handleSend : handleMarkPaid}
                loading={updating}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small">{value}</ThemedText>
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
  editButton: {
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
    padding: 22,
    marginBottom: 16,
  },
  heroLabel: {
    marginBottom: 8,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
    marginBottom: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  detailCol: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '600',
  },
  clientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  clientAvatar: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
  },
  sendButtonWrap: {
    flex: 1,
  },
});
