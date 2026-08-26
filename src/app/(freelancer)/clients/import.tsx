import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { IcoCheck, IcoUpload } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { findColumn, parseCsv } from '@/lib/csv';
import { createClientAccount } from '@/lib/queries';

const EMAIL_RE = /\S+@\S+\.\S+/;

type RowState = 'pending' | 'importing' | 'created' | 'linked' | 'failed';

interface ImportRow {
  name: string;
  email: string;
  valid: boolean;
  invalidReason?: string;
  state: RowState;
  error?: string;
}

export default function ImportClientsScreen() {
  const theme = useTheme();
  const { radius } = useThemeTokens();
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const pickFile = async () => {
    setParseError(null);
    setRows(null);
    setDone(false);

    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'text/plain', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;

    try {
      const asset = result.assets[0];
      // On web, DocumentPickerAsset exposes a native browser File (readable
      // directly); on native, expo-file-system reads the copied cache uri.
      const text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
      const table = parseCsv(text);
      if (table.length < 1) {
        setParseError('That file looks empty.');
        return;
      }

      const [header, ...dataRows] = table;
      const nameIdx = findColumn(header, 'name', 'client name', 'full name');
      const emailIdx = findColumn(header, 'email', 'email address');
      if (nameIdx === -1 || emailIdx === -1) {
        setParseError('Could not find "name" and "email" columns. The first row should be a header with those column names.');
        return;
      }

      const parsed: ImportRow[] = dataRows
        .filter((r) => r.some((cell) => cell.trim() !== ''))
        .map((r) => {
          const name = (r[nameIdx] ?? '').trim();
          const email = (r[emailIdx] ?? '').trim();
          let invalidReason: string | undefined;
          if (!name) invalidReason = 'Missing name';
          else if (!email) invalidReason = 'Missing email';
          else if (!EMAIL_RE.test(email)) invalidReason = 'Invalid email';
          return { name, email, valid: !invalidReason, invalidReason, state: 'pending' as RowState };
        });

      if (parsed.length === 0) {
        setParseError('No data rows found below the header.');
        return;
      }
      setRows(parsed);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not read that file.');
    }
  };

  const validCount = rows?.filter((r) => r.valid).length ?? 0;
  const invalidCount = (rows?.length ?? 0) - validCount;

  const runImport = async () => {
    if (!rows) return;
    setImporting(true);
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].valid) continue;
      setRows((prev) => prev!.map((r, idx) => (idx === i ? { ...r, state: 'importing' } : r)));
      try {
        const result = await createClientAccount(rows[i].name, rows[i].email);
        setRows((prev) => prev!.map((r, idx) => (idx === i ? { ...r, state: result.isNewAccount ? 'created' : 'linked' } : r)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not add this client.';
        setRows((prev) => prev!.map((r, idx) => (idx === i ? { ...r, state: 'failed', error: message } : r)));
      }
    }
    setImporting(false);
    setDone(true);
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {!rows ? (
          <>
            <ThemedText type="small" themeColor="textSecondary" style={styles.intro}>
              Import clients from a spreadsheet — export it as CSV first. The first row should be a
              header with <ThemedText type="smallBold">name</ThemedText> and{' '}
              <ThemedText type="smallBold">email</ThemedText> columns; any other columns are ignored.
              A new client without a Ledger account yet gets one created automatically, same as adding
              them one at a time.
            </ThemedText>
            {parseError ? (
              <ThemedText type="small" themeColor="danger" style={styles.error}>
                {parseError}
              </ThemedText>
            ) : null}
            <PrimaryButton label="Choose CSV file" onPress={pickFile} />
          </>
        ) : (
          <>
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 4 }]}>
              <IcoUpload color={theme.textSecondary} size={16} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.summaryText}>
                {validCount} ready to import
                {invalidCount > 0 ? ` · ${invalidCount} skipped (invalid)` : ''}
              </ThemedText>
            </View>

            <View style={styles.list}>
              {rows.map((row, i) => (
                <RowItem key={`${row.email}-${i}`} row={row} />
              ))}
            </View>

            {done ? (
              <PrimaryButton label="Done" onPress={() => router.back()} />
            ) : (
              <>
                <PrimaryButton label={`Import ${validCount} client${validCount === 1 ? '' : 's'}`} onPress={runImport} loading={importing} disabled={validCount === 0} />
                <View style={styles.buttonGap} />
                <PrimaryButton label="Choose a different file" variant="secondary" onPress={pickFile} disabled={importing} />
              </>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function RowItem({ row }: { row: ImportRow }) {
  const theme = useTheme();
  const { radius } = useThemeTokens();

  const statusText =
    row.state === 'importing'
      ? 'Importing…'
      : row.state === 'created'
        ? 'Account created'
        : row.state === 'linked'
          ? 'Linked to existing account'
          : row.state === 'failed'
            ? (row.error ?? 'Failed')
            : row.valid
              ? 'Ready'
              : row.invalidReason;

  const statusColor = row.state === 'failed' || !row.valid ? 'danger' : row.state === 'created' || row.state === 'linked' ? 'success' : 'textSecondary';

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 6, opacity: row.valid ? 1 : 0.6 }]}>
      <View style={styles.rowInfo}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {row.name || '(no name)'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {row.email || '(no email)'}
        </ThemedText>
      </View>
      {row.state === 'created' || row.state === 'linked' ? (
        <IcoCheck color={theme.success} size={16} />
      ) : (
        <ThemedText type="small" themeColor={statusColor} style={styles.statusText}>
          {statusText}
        </ThemedText>
      )}
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
  error: {
    marginBottom: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginBottom: 16,
  },
  summaryText: {
    flex: 1,
  },
  list: {
    gap: 8,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  statusText: {
    flexShrink: 1,
    textAlign: 'right',
  },
  buttonGap: {
    height: 12,
  },
});
