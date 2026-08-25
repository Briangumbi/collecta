import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { formatCurrency, formatInvoiceRef } from '@/lib/format';
import type { InvoiceWithClient } from '@/lib/queries';

const CARD_WIDTH = 220;
const CARD_HEIGHT = 130;

export function ClientBalanceCarousel({ invoices }: { invoices: InvoiceWithClient[] }) {
  const theme = useTheme();
  const { radius, fontSize, fonts } = useThemeTokens();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} decelerationRate="fast" snapToInterval={CARD_WIDTH + 12}>
      {invoices.map((invoice) => {
        const isOverdue = invoice.status === 'overdue';
        const accent = isOverdue ? theme.danger : theme.primary;
        const accentBg = isOverdue ? theme.dangerBg : theme.warningBg;

        return (
          <Pressable key={invoice.id} onPress={() => router.push(`/(freelancer)/invoices/${invoice.id}`)}>
            <LinearGradient
              colors={[theme.backgroundSelected, theme.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderRadius: radius.card, borderColor: `${accent}18` }]}
            >
              <View pointerEvents="none" style={[styles.ringOuter, { borderColor: `${accent}15` }]} />
              <View pointerEvents="none" style={[styles.ringInner, { borderColor: `${accent}10` }]} />

              <View style={[styles.statusPill, { backgroundColor: accentBg, borderRadius: radius.pill }]}>
                <View style={[styles.statusDot, { backgroundColor: accent }]} />
                <ThemedText type="label" style={{ color: accent, marginBottom: 0 }}>
                  {isOverdue ? 'Overdue' : 'Pending'}
                </ThemedText>
              </View>

              <ThemedText type="smallBold" numberOfLines={1} style={styles.clientName}>
                {invoice.client?.name ?? 'Unknown client'}
              </ThemedText>

              <View style={styles.amountRow}>
                <ThemedText
                  style={{
                    fontFamily: fonts.displayHeavy,
                    fontSize: 26,
                    letterSpacing: -0.5,
                    color: isOverdue ? theme.danger : theme.text,
                  }}
                >
                  {formatCurrency(Number(invoice.amount), invoice.currency)}
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: fontSize.code }}>
                  {formatInvoiceRef(invoice.id)}
                </ThemedText>
              </View>
            </LinearGradient>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    overflow: 'hidden',
  },
  ringOuter: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ringInner: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 10,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  clientName: {
    marginBottom: 2,
  },
  amountRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
});
