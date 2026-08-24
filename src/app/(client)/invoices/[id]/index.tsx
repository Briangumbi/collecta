import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { GlowBackground } from '@/components/glow-background';
import { PrimaryButton } from '@/components/primary-button';
import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/lib/format';
import { getInvoiceDetail } from '@/lib/queries';
import type { Invoice } from '@/types/database';

export default function ClientInvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getInvoiceDetail(id).then((result) => {
      setInvoice(result.invoice);
      setLoading(false);
    });
  }, [id]);

  if (loading || !invoice) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground width={480} height={320} cy="0%" r="60%" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountBlock}>
          <ThemedText type="label" themeColor="textSecondary">
            Amount due
          </ThemedText>
          <ThemedText type="hero" themeColor="primary" style={styles.amount}>
            {formatCurrency(Number(invoice.amount), invoice.currency)}
          </ThemedText>
          <InvoiceStatusBadge status={invoice.status} />
        </View>

        <Card style={styles.card}>
          <Row label="Due" value={formatDate(invoice.due_date)} />
          <Row label="Invoice created" value={formatDate(invoice.created_at)} />
          {invoice.paid_at ? <Row label="Paid" value={formatDate(invoice.paid_at)} /> : null}
        </Card>

        {invoice.status !== 'paid' ? (
          <PrimaryButton
            label={`Pay ${formatCurrency(Number(invoice.amount), invoice.currency)}`}
            onPress={() => router.push(`/(client)/invoices/${invoice.id}/pay`)}
          />
        ) : (
          <ThemedText type="small" themeColor="success" style={styles.paidNote}>
            This invoice has been paid — thank you!
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
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
    paddingBottom: 60,
  },
  amountBlock: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  },
  amount: {
    marginVertical: 2,
  },
  card: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  paidNote: {
    textAlign: 'center',
  },
});
