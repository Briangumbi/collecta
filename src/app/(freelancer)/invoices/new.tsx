import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ClientPicker } from '@/components/client-picker';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ToggleSwitch } from '@/components/toggle-switch';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/format';
import { createInvoice, createInvoiceTemplate, getClientDetail, getClients } from '@/lib/queries';
import type { Profile, Project, RecurringInterval } from '@/types/database';

const INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function NewInvoiceScreen() {
  const { profile } = useAuth();
  const theme = useTheme();
  const [clients, setClients] = useState<Profile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [interval, setInterval] = useState<RecurringInterval>('monthly');
  const [startDate, setStartDate] = useState(() => new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getClients(profile.id).then(setClients);
  }, [profile]);

  useEffect(() => {
    if (!selectedClientId) {
      setProjects([]);
      setSelectedProjectId(null);
      return;
    }
    getClientDetail(selectedClientId).then((result) => setProjects(result.projects));
  }, [selectedClientId]);

  const submit = async (status: 'draft' | 'sent') => {
    if (!profile || !selectedClientId) {
      setError('Choose a client first.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (recurring) {
        await createInvoiceTemplate({
          freelancerId: profile.id,
          clientId: selectedClientId,
          projectId: selectedProjectId,
          amount: numericAmount,
          interval,
          startDate: startDate.toISOString().slice(0, 10),
        });
      } else {
        await createInvoice({
          freelancerId: profile.id,
          clientId: selectedClientId,
          projectId: selectedProjectId,
          amount: numericAmount,
          dueDate: dueDate.toISOString().slice(0, 10),
          status,
        });
      }
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          Client
        </ThemedText>
        <ClientPicker clients={clients} selectedId={selectedClientId} onSelect={setSelectedClientId} />

        {projects.length > 0 ? (
          <>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Project (optional)
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectRow}>
              {projects.map((project) => {
                const selected = project.id === selectedProjectId;
                return (
                  <Pressable
                    key={project.id}
                    onPress={() => setSelectedProjectId(selected ? null : project.id)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? theme.primary : theme.border,
                        backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                      },
                    ]}
                  >
                    <ThemedText type="small" themeColor={selected ? 'primary' : 'text'}>
                      {project.title}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        <TextField label="Amount (USD)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />

        <View style={styles.recurringRow}>
          <View style={styles.recurringLabelWrap}>
            <ThemedText type="default">Repeat this invoice</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Auto-generates a new invoice on schedule — good for retainers.
            </ThemedText>
          </View>
          <ToggleSwitch value={recurring} onValueChange={setRecurring} />
        </View>

        {recurring ? (
          <>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Repeats
            </ThemedText>
            <View style={styles.intervalRow}>
              {INTERVALS.map(({ value, label }) => {
                const selected = value === interval;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setInterval(value)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? theme.primary : theme.border,
                        backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                      },
                    ]}
                  >
                    <ThemedText type="small" themeColor={selected ? 'primary' : 'text'}>
                      {label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Starts on
            </ThemedText>
            <Pressable
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <ThemedText type="default">{formatDate(startDate.toISOString())}</ThemedText>
            </Pressable>
            {showStartDatePicker ? (
              <DateTimePicker
                value={startDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, selected) => {
                  setShowStartDatePicker(Platform.OS === 'ios');
                  if (selected) setStartDate(selected);
                }}
              />
            ) : null}
          </>
        ) : (
          <>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Due date
            </ThemedText>
            <Pressable
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText type="default">{formatDate(dueDate.toISOString())}</ThemedText>
            </Pressable>
            {showDatePicker ? (
              <DateTimePicker
                value={dueDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, selected) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selected) setDueDate(selected);
                }}
              />
            ) : null}
          </>
        )}

        {error ? (
          <ThemedText type="small" themeColor="danger" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.buttonSpacer} />
        {recurring ? (
          <PrimaryButton label="Save recurring invoice" onPress={() => submit('sent')} loading={submitting} />
        ) : (
          <>
            <PrimaryButton label="Send invoice" onPress={() => submit('sent')} loading={submitting} />
            <View style={styles.buttonGap} />
            <PrimaryButton label="Save as draft" variant="secondary" onPress={() => submit('draft')} loading={submitting} />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  label: {
    marginBottom: 8,
    marginTop: 4,
  },
  projectRow: {
    gap: 8,
    marginBottom: 16,
  },
  intervalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  recurringLabelWrap: {
    flex: 1,
    gap: 2,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dateButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  error: {
    marginBottom: 12,
  },
  buttonSpacer: {
    height: 8,
  },
  buttonGap: {
    height: 12,
  },
});
