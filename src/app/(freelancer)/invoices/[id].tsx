import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { GlowBackground } from '@/components/glow-background';
import { PrimaryButton } from '@/components/primary-button';
import { InvoiceStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/lib/format';
import { getInvoiceDetail, markInvoicePaidManually, markInvoiceSent } from '@/lib/queries';
import type { Invoice, Profile } from '@/types/database';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    if (!id) return;
    const result = await getInvoiceDetail(id);
    setInvoice(result.invoice);
    setClient(result.client);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !invoice || !client) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const handleMarkPaid = () => {
    Alert.alert('Mark as paid?', 'Use this if the client paid outside Ledger (bank transfer, cash, etc).', [
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

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground width={480} height={280} cy="0%" r="60%" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountBlock}>
          <ThemedText type="hero" themeColor="primary" style={styles.amount}>
            {formatCurrency(Number(invoice.amount), invoice.currency)}
          </ThemedText>
          <InvoiceStatusBadge status={invoice.status} />
        </View>

        <Card style={styles.card}>
          <View style={styles.clientRow}>
            <Avatar name={client.name} size={40} />
            <View style={styles.clientText}>
              <ThemedText type="smallBold">{client.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {client.email}
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Row label="Created" value={formatDate(invoice.created_at)} />
          <Row label="Due" value={formatDate(invoice.due_date)} />
          <Row label="Paid" value={invoice.paid_at ? formatDate(invoice.paid_at) : '—'} />
          {invoice.payment_transaction_id ? <Row label="Payment reference" value={invoice.payment_transaction_id} /> : null}
        </Card>

        {invoice.status === 'draft' ? (
          <PrimaryButton label="Send to client" onPress={handleSend} loading={updating} />
        ) : null}

        {invoice.status !== 'paid' ? (
          <View style={invoice.status === 'draft' ? styles.buttonGap : undefined}>
            <PrimaryButton label="Mark as paid manually" variant="secondary" onPress={handleMarkPaid} loading={updating} />
          </View>
        ) : null}
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
    marginBottom: 16,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientText: {
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  buttonGap: {
    marginTop: 12,
  },
});
