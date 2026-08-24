import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, formatDate } from '@/lib/format';
import type { InvoiceWithClient } from '@/lib/queries';

const CARD_HEIGHT = 108;
const PEEK_OFFSET = 16;

/**
 * Genuine layered z-index depth, not a metaphor — the front card is the
 * actual next-due invoice and is the only one that's interactive; the ones
 * behind are a visual preview of what's queued up next, offset and dimmed
 * rather than a flat list.
 */
export function StackedInvoiceDeck({ invoices }: { invoices: InvoiceWithClient[] }) {
  const theme = useTheme();
  if (invoices.length === 0) return null;

  const cards = invoices.slice(0, 3);

  return (
    <View style={[styles.wrap, { height: CARD_HEIGHT + (cards.length - 1) * PEEK_OFFSET }]}>
      {cards.map((invoice, depth) => (
        <Pressable
          key={invoice.id}
          disabled={depth !== 0}
          onPress={() => router.push(`/(freelancer)/invoices/${invoice.id}`)}
          style={[
            styles.card,
            {
              // All shadow* props must share one object — see Card's comment
              // for why (react-native-web silently drops the shadow otherwise).
              top: depth * PEEK_OFFSET,
              zIndex: cards.length - depth,
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: 1 - depth * 0.22,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.22,
              shadowRadius: 16,
            },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.left}>
              <ThemedText type="smallBold" numberOfLines={1}>
                {invoice.client?.name ?? 'Unknown client'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Due {formatDate(invoice.due_date)}
              </ThemedText>
            </View>
            <View style={styles.right}>
              <ThemedText type="smallBold" themeColor="primary" style={styles.amount}>
                {formatCurrency(Number(invoice.amount), invoice.currency)}
              </ThemedText>
              <InvoiceStatusBadge status={invoice.status} />
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    borderRadius: Radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    justifyContent: 'center',
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 16,
  },
});
