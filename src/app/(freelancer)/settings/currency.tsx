import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IcoCheck } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { CURRENCIES } from '@/constants/currencies';
import { supabase } from '@/lib/supabase';

export default function CurrencySettingsScreen() {
  const { profile, refreshProfile } = useAuth();
  const theme = useTheme();
  const { radius } = useThemeTokens();
  const [saving, setSaving] = useState<string | null>(null);

  if (!profile) return null;

  const selectCurrency = async (code: string) => {
    if (code === profile.default_currency) return;
    setSaving(code);
    await supabase.from('profiles').update({ default_currency: code }).eq('id', profile.id);
    await refreshProfile();
    setSaving(null);
  };

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.intro}>
          Pre-fills new invoices and scopes your dashboard totals to this currency — invoices you
          create in a different currency still work, they just aren’t included in aggregate totals
          like Outstanding Balance.
        </ThemedText>

        <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card }]}>
          {CURRENCIES.map(({ code, label }, i) => {
            const selected = code === profile.default_currency;
            return (
              <Pressable
                key={code}
                onPress={() => selectCurrency(code)}
                disabled={saving !== null}
                style={[
                  styles.row,
                  i < CURRENCIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                  { opacity: saving && saving !== code ? 0.5 : 1 },
                ]}
              >
                <View>
                  <ThemedText type="default">{code.toUpperCase()}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {label}
                  </ThemedText>
                </View>
                {selected ? <IcoCheck color={theme.primary} size={16} /> : null}
              </Pressable>
            );
          })}
        </View>
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
  intro: {
    marginBottom: 20,
    lineHeight: 19,
  },
  listCard: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 18,
  },
});
