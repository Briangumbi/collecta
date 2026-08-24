import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { GlowBackground } from '@/components/glow-background';
import { PaymentSuccessOverlay } from '@/components/payment-success-overlay';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VirtualCardPreview } from '@/components/virtual-card-preview';
import { useSimulatedPayment } from '@/hooks/use-simulated-payment';
import { useTheme } from '@/hooks/use-theme';
import { formatCardNumber, formatExpiry, isCardNumberValid, isCvcValid, isExpiryValid } from '@/lib/card-format';
import { formatCurrency } from '@/lib/format';
import { getInvoiceDetail } from '@/lib/queries';
import type { Invoice } from '@/types/database';

type Phase = 'form' | 'processing' | 'success' | 'declined';

export default function PayInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pay } = useSimulatedPayment();
  const theme = useTheme();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [phase, setPhase] = useState<Phase>('form');
  const [declineReason, setDeclineReason] = useState('');

  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    if (!id) return;
    getInvoiceDetail(id).then((result) => setInvoice(result.invoice));
  }, [id]);

  const isFormValid = name.trim().length > 1 && isCardNumberValid(cardNumber) && isExpiryValid(expiry) && isCvcValid(cvc);

  const handleSubmit = async () => {
    if (!invoice) return;
    setPhase('processing');
    try {
      const outcome = await pay(invoice.id, cardNumber);
      if (outcome.status === 'success') {
        setPhase('success');
      } else {
        setDeclineReason(outcome.reason);
        setPhase('declined');
      }
    } catch (err) {
      setDeclineReason(err instanceof Error ? err.message : 'Something went wrong — please try again.');
      setPhase('declined');
    }
  };

  if (!invoice) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (phase === 'success') {
    return (
      <PaymentSuccessOverlay
        amountLabel={formatCurrency(Number(invoice.amount), invoice.currency)}
        onDone={() => router.replace(`/(client)/invoices/${invoice.id}`)}
      />
    );
  }

  if (phase === 'processing') {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type="default" themeColor="textSecondary" style={styles.processingLabel}>
          Processing payment…
        </ThemedText>
      </ThemedView>
    );
  }

  if (phase === 'declined') {
    return (
      <ThemedView style={styles.center}>
        <View style={[styles.declineIcon, { backgroundColor: theme.dangerBg, borderColor: theme.border }]}>
          <Ionicons name="close" size={40} color={theme.danger} />
        </View>
        <ThemedText type="subtitle" style={styles.declineTitle}>
          Payment declined
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.declineMessage}>
          {declineReason}
        </ThemedText>
        <View style={styles.declineButton}>
          <PrimaryButton label="Try again" onPress={() => setPhase('form')} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground width={480} height={260} cy="-4%" r="55%" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="hero" themeColor="primary" style={styles.amount}>
            {formatCurrency(Number(invoice.amount), invoice.currency)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Enter any card details — this is a simulated payment, no real card is charged.
          </ThemedText>

          <VirtualCardPreview name={name} number={cardNumber} expiry={expiry} />

          <TextField label="Cardholder name" value={name} onChangeText={setName} placeholder="Jane Whitfield" autoCapitalize="words" />
          <TextField
            label="Card number"
            value={cardNumber}
            onChangeText={(v) => setCardNumber(formatCardNumber(v))}
            placeholder="4242 4242 4242 4242"
            keyboardType="number-pad"
            maxLength={19}
          />
          <View style={styles.row}>
            <View style={styles.rowField}>
              <TextField
                label="Expiry"
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                placeholder="MM/YY"
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={styles.rowField}>
              <TextField
                label="CVC"
                value={cvc}
                onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                keyboardType="number-pad"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.testHint}>
            Tip: a card number ending in 0000 always simulates a decline.
          </ThemedText>

          <PrimaryButton
            label={`Pay ${formatCurrency(Number(invoice.amount), invoice.currency)}`}
            onPress={handleSubmit}
            disabled={!isFormValid}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  amount: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  testHint: {
    marginBottom: 20,
    textAlign: 'center',
  },
  processingLabel: {
    marginTop: 16,
  },
  declineIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  declineTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  declineMessage: {
    textAlign: 'center',
    marginBottom: 32,
  },
  declineButton: {
    width: '100%',
  },
});
