import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { IcoChevronRight } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { avatarColorFor } from '@/lib/avatar-colors';
import { daysUntil, formatCurrency, formatInvoiceRef } from '@/lib/format';
import type { InvoiceWithClient } from '@/lib/queries';

export function DashboardInvoiceRow({ invoice }: { invoice: InvoiceWithClient }) {
  const theme = useTheme();
  const { radius, cardShadow } = useThemeTokens();
  const isOverdue = invoice.status === 'overdue';
  const accent = isOverdue ? theme.danger : theme.primary;
  const accentBg = isOverdue ? theme.dangerBg : theme.warningBg;
  const clientName = invoice.client?.name ?? 'Unknown client';
  const initials = clientName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const days = daysUntil(invoice.due_date);
  const dueLabel = isOverdue ? 'Overdue' : days !== null && days >= 0 ? `Due in ${days}d` : 'Due soon';

  return (
    <Pressable
      onPress={() => router.push(`/(freelancer)/invoices/${invoice.id}`)}
      style={[
        styles.row,
        {
          borderRadius: radius.card,
          backgroundColor: theme.backgroundElement,
          shadowColor: cardShadow.color,
          shadowOffset: cardShadow.offset,
          shadowOpacity: cardShadow.opacity,
          shadowRadius: cardShadow.radius,
          elevation: cardShadow.elevation,
        },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: `${avatarColorFor(invoice.client_id)}22`, borderColor: `${avatarColorFor(invoice.client_id)}33` }]}>
        <ThemedText type="smallBold" style={{ color: avatarColorFor(invoice.client_id) }}>
          {initials}
        </ThemedText>
      </View>

      <View style={styles.middle}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {clientName}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText type="code" themeColor="textSecondary">
            {formatInvoiceRef(invoice.id)}
          </ThemedText>
          {invoice.project?.title ? (
            <>
              <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.category}>
                {invoice.project.title}
              </ThemedText>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        <ThemedText type="smallBold">{formatCurrency(Number(invoice.amount), invoice.currency)}</ThemedText>
        <View style={[styles.statusPill, { backgroundColor: accentBg, borderRadius: radius.pill }]}>
          <ThemedText type="label" style={{ color: accent, marginBottom: 0 }}>
            {dueLabel}
          </ThemedText>
        </View>
      </View>

      <IcoChevronRight color={theme.border} size={14} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  middle: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  category: {
    flexShrink: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
});
