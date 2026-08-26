import { router } from 'expo-router';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { IcoRepeat } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ToggleSwitch } from '@/components/toggle-switch';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { avatarColorFor } from '@/lib/avatar-colors';
import { formatCurrency, formatDate } from '@/lib/format';
import { deleteInvoiceTemplate, getInvoiceTemplates, setInvoiceTemplateActive, type InvoiceTemplateWithClient } from '@/lib/queries';
import type { RecurringInterval } from '@/types/database';

const INTERVAL_LABEL: Record<RecurringInterval, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export default function RecurringInvoicesScreen() {
  const { profile } = useAuth();
  const freelancerId = profile?.id ?? '';
  const { data, isLoading, refetch } = useCachedQuery(`invoice-templates:${freelancerId}`, () => getInvoiceTemplates(freelancerId));
  const templates = data ?? [];

  return (
    <ThemedView style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <ThemedText type="small" themeColor="textSecondary" style={styles.intro}>
          Recurring invoices generate automatically on schedule — good for retainers and repeat
          clients. New ones show up here after the next run.
        </ThemedText>

        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onChanged={refetch} />
        ))}

        {!isLoading && templates.length === 0 ? (
          <View style={styles.empty}>
            <IcoRepeat color="#8a7d6c" size={28} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              No recurring invoices yet.
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.buttonSpacer} />
        <PrimaryButton label="New recurring invoice" onPress={() => router.push('/(freelancer)/invoices/new')} />
      </ScrollView>
    </ThemedView>
  );
}

function TemplateCard({ template, onChanged }: { template: InvoiceTemplateWithClient; onChanged: () => void }) {
  const theme = useTheme();
  const { radius, cardShadow } = useThemeTokens();
  const accent = avatarColorFor(template.client_id);
  const clientName = template.client?.name ?? 'Unknown client';
  const initials = clientName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleDelete = () => {
    Alert.alert('Cancel this recurring invoice?', `Future invoices for ${clientName} will stop generating. This doesn't affect invoices already sent.`, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel series', style: 'destructive', onPress: async () => {
          await deleteInvoiceTemplate(template.id);
          onChanged();
        } },
    ]);
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 2 },
        { shadowColor: cardShadow.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: cardShadow.opacity, shadowRadius: 16, elevation: 3 },
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.avatar, { backgroundColor: `${accent}18`, borderColor: `${accent}28` }]}>
          <ThemedText type="smallBold" style={{ color: accent }}>
            {initials}
          </ThemedText>
        </View>
        <View style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {clientName}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {INTERVAL_LABEL[template.interval]} · next {formatDate(template.next_run_date)}
          </ThemedText>
        </View>
        <ThemedText type="smallBold">{formatCurrency(Number(template.amount), template.currency)}</ThemedText>
      </View>

      <View style={[styles.cardBottomRow, { borderTopColor: theme.border }]}>
        <View style={styles.pauseRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {template.active ? 'Active' : 'Paused'}
          </ThemedText>
          <ToggleSwitch value={template.active} onValueChange={(active) => setInvoiceTemplateActive(template.id, active).then(onChanged)} />
        </View>
        <Pressable onPress={handleDelete} hitSlop={8}>
          <ThemedText type="small" themeColor="danger">
            Cancel series
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  intro: {
    marginBottom: 20,
    lineHeight: 19,
  },
  card: {
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pauseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    marginTop: 40,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
  buttonSpacer: {
    height: 12,
  },
});
